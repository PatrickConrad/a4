import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getFtpFunctions } from "../helpers/ftp";
import { xlsxGetAllDataArrays } from "../helpers/csv";

export const a4DataReader = async () => {
    try{
        const dirs = ['./tmp', ',/tmp/a4'];
        for(const d of dirs){
            if(!existsSync(d)) mkdirSync(d);
        }
        console.log({host: `${process.env.A4_FTP_HOST}`, user: `${process.env.A4_FTP_USER}`, password: `${process.env.A4_FTP_PASSWORD}`, port: process.env.A4_FTP_PORT==null?21:parseInt(`${process.env.A4_FTP_PORT}`)})
        const a4Ftp = await getFtpFunctions({host: `${process.env.A4_FTP_HOST}`, user: `${process.env.A4_FTP_USER}`, password: `${process.env.A4_FTP_PASSWORD}`, port: process.env.A4_FTP_PORT==null?21:parseInt(`${process.env.A4_FTP_PORT}`)});
        const hasA4FtpFile = await a4Ftp.downloadFromFTP('/PDLOADX.XLSX', './tmp/a4/a4-data.xlsx')
        await a4Ftp.closeFtp();
        if(!hasA4FtpFile){
            console.log('Bad a4 data')
            return; 
        }

        const priceData = await xlsxGetAllDataArrays('./tmp/a4/a4-data.xlsx')
        if(priceData==null){
            console.log('bad data')
            return;
        }
        writeFileSync('./tmp/a4/a4-data.csv', priceData[0].data.join('\r\n'), 'utf-8');
        const loFtp = await getFtpFunctions();
        await loFtp.saveToFTP('./tmp/a4/a4-data.xlsx', '/formatted-data/a4/a4-data.xlsx', false);
        await loFtp.saveToFTP('./tmp/a4/a4-data.csv', '/formatted-data/a4/a4-data.csv', false);
        await loFtp.closeFtp();

        console.log('Done a4')
        return
    }
    catch(err:any){
        console.log({err})
        console.log('Error reading a4 data')
        return
    }
}
