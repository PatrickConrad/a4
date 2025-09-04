import fs, { existsSync } from 'fs';
import * as ftp from 'basic-ftp';
import { wait } from './wait';


const connectToFTP = async () => {
    const client = new ftp.Client()
    client.ftp.verbose = true
    const clientAccessInfo = {
        host: process.env.LO_FTP_HOST as string,
        user: process.env.LO_FTP_USER as string,
        password: process.env.LO_FTP_PASSWORD as string,
        port: parseInt(process.env.LO_FTP_PORT as string),
        secure: false
    }
    await client.access(clientAccessInfo)
    return client
}






export const getFtpFunctions = async (connectionData?: {host: string, user: string, password: string, port?: number}) => {
    const client = new ftp.Client()
    client.ftp.verbose = true
    console.log({connectionData});
    const loPort = process.env.LO_FTP_PORT!=null?parseInt(`${process.env.LO_FTP_PORT}`):21;
    const isLoSecure = loPort===22?true:false;

    const hasConnectionPort = connectionData!=null&&connectionData.port!=null?parseInt(`${connectionData.port}`):21
    const isSecure = hasConnectionPort===22?true:false;
    console.log({fPort: process.env.LO_FTP_PASSWORD, hasConnectionPort, isSecure, loPort, isLoSecure})
    const clientAccessInfo = {
        host: connectionData!=null?connectionData.host:process.env.LO_FTP_HOST as string,
        user: connectionData!=null?connectionData.user:process.env.LO_FTP_USER as string,
        password: connectionData!=null?connectionData.password:process.env.LO_FTP_PASSWORD as string,
        port: connectionData!=null?hasConnectionPort:loPort,
        secure: connectionData!=null?isSecure:isLoSecure
    }
    console.log({clientAccessInfo})
    await client.access(clientAccessInfo)

    const uploadDirToFTP = async(dirPath: string, ftpPath?: string) =>{
        try{
            await client.uploadFromDir(dirPath, ftpPath==null?'/':ftpPath.startsWith('/')?ftpPath:`/${ftpPath}`);
        }
        catch(err: any){
            console.log({err})
        }
    }

    const getFileNamesInDir = async(ftpDir: string) => {
        try{
            const list = await client.list(`${ftpDir}${ftpDir.endsWith('/')?'':'/'}`);
            return list
        }
        catch(err: any){
            console.log('ERROR: ', err)
            return [];
        }
    }

    const getModificationInfo = async(ftpPath: string, ) => {
        const checkDate = new Date(await client.lastMod(ftpPath))
        const modDate = `${checkDate.getMonth()+1}-${checkDate.getDate()}-${checkDate.getFullYear()};${checkDate.getHours()}H:${checkDate.getMinutes()}M`
        console.log({modDate})
        return modDate
    }

    const findFtpFilesContaining = async(ftpDir: string, fileString: string) => {
        try{
            const list = await client.list(`${ftpDir}${ftpDir.endsWith('/')?'':'/'}`);
            const matching = list.filter(file=>file.name.toLowerCase().includes(fileString.toLowerCase())).map(m=>m.name);
            console.log({matching})
            return matching
        }
        catch(err: any){
            console.log('ERROR: ', err)
            return [];
        }
    }

    const findFtpFilesAfterDate = async(ftpDir: string, date: number) => {
        try{
            const list = await client.list(`${ftpDir}${ftpDir.endsWith('/')?'':'/'}`);
            // console.log({dates: list.map(l=>{return {date: l.date, mod: l.modifiedAt, newD: new Date().toISOString()}})})
            const nameDate = list.map(l=>{return {name: l.name, date: new Date(l.date).getTime()}})
            const newFiles = nameDate.filter(nd=>nd.date>=date);
            return newFiles
        }
        catch(err: any){
            console.log('ERROR: ', err)
            return [];
        }
    }

    const removeFromFTP = async(ftpPath: string) => {
        try{
            await client.remove(ftpPath)
        }
        catch(err: any){
            console.log('ERROR: ', err)
        }
    }

    const downloadFromFTP = async(ftpPath: string, saveFilePath: string, startAt?: number) => {
    
        console.log("DOWNLOADING", ftpPath, ' : ', saveFilePath)
        const starter = startAt==null?0:startAt
        await client.downloadTo(saveFilePath, ftpPath, starter);
        const curCheck: (checker: number)=>Promise<boolean> = async (checker: number)=>{
            if(checker>200) return false;
            const fileExist = existsSync(saveFilePath);
            if(!fileExist){
                await wait(100);
                return await curCheck(checker+1)
            }
            return true
        }
        const hasFile = await curCheck(0);

        return hasFile
    }

    const saveToFTP = async(srcFilePath: string, saveFilePath: string, remove: boolean) => {
        await client.uploadFrom(srcFilePath, saveFilePath);
        // console.log("UPLOADING")
        // console.log({ftpResp});
        // const resCode = `${ftpResp.code}`.substring(0,1);
        // const badStarts = ['4', '5'];
        if(remove){
            fs.rmSync(srcFilePath)
        }


    }

    const saveMultipleFilesToFTP = async(srcFilePath: string, saveFilePath: string, files: string[], remove: boolean) => {
        try{
            const finalSavePath = saveFilePath.endsWith('/')?saveFilePath:`${saveFilePath}/`
            const finalSrcPath = srcFilePath.endsWith('/')?srcFilePath:`${srcFilePath}/`
            for(let file=0;file<files.length;file++){
                await client.uploadFrom(`${finalSrcPath}${files[file]}`, `${finalSavePath}${files[file]}`);
                if(remove){
                    fs.rmSync(`${finalSrcPath}${files[file]}`)
                }
            }
        }
        catch(err: any){
            console.log('err');
        }
    
    
    }

    const closeFtp = async() => await client.close();

    return {uploadDirToFTP, getFileNamesInDir, getModificationInfo, findFtpFilesAfterDate, findFtpFilesContaining, removeFromFTP, downloadFromFTP, saveToFTP, saveMultipleFilesToFTP, closeFtp}
}