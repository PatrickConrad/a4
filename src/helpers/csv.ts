import { appendFile, appendFileSync, createReadStream, readFileSync, writeFileSync } from "fs";
import xlsx from 'node-xlsx';

import { removeDblSpace } from "./test-formatting";
// const gc = require('expose-gc/function')





export const xlsxGetAllDataArrays = async (path: string)=> {
    try{
        const data = readFileSync(path);
        const sheets = await xlsx.parse(data, {defval: ''});
        const newData: {name: string, data: string[][]}[] = [];
        for(const sheet of sheets){
            let maxCols = sheet.data[0].length-1;
            for(const row of sheet.data){
                for(let c =0;c<row.length;c++){
                    const cell = row[c];
                    if(cell!=null&&cell!==''&&c>maxCols) maxCols=c;
                }
            }
            const newSheetData = sheet.data.map(row=>{
                const getDiffArray = () => {
                    const newCells = maxCols-(row.length-1)
                    return Array.from({length: newCells}, ()=>'');
                }
                const newRow = row.map(cell=>{
                    return cell==null?'':`${removeDblSpace(`${cell}`.replace(/\n/g,' ').trim())}`
                })
                return [...newRow, ...getDiffArray()]
            })
            newData.push({name: sheet.name, data: newSheetData});
        }
        return newData;
    }
    catch(err: any){
        console.log({err})
        return null
    }
}

export const xlsxFileToArray = async (path: string, sheet: number|string, headerRow?: number)=> {
    try{
        const data = readFileSync(path);
        const file = await xlsx.parse(data);
        let currentSheet: string[][] = []
        if(typeof(sheet)==='string'){
            const sheetFinder = file.find(f=>`${f.name}`.toLowerCase().includes(sheet.toLowerCase()));
            if(sheetFinder!=null){
                currentSheet = sheetFinder.data
            }
        }
        else{
            currentSheet= file[sheet].data;

        }
        const headers = currentSheet[headerRow!=null?headerRow:0];
        // console.log({headers})

        const setFinder = (headerName: string)=>{
            // console.log(currentSheet[0])
            const headerPosition = currentSheet[headerRow!=null?headerRow:0].map(heads=>{
                return heads.trim().toLowerCase()
            }).indexOf(headerName.toLowerCase());
            // console.log({headerPosition});
            return headerPosition
            
        }
        const getVal = (row: number, col: string) => {
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                // console.log('NO COLUMN FOUND')
                return ''
            }
            // console.log(col, colNum, currentSheet[row][colNum])
            const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
            return val;
        }
        
        const changeColVal = (row: string[], col: string, newVal: string)=>{
                const colNum = setFinder(col);
                if(colNum==null||colNum===-1){
                    console.log('NO COLUMN FOUND')
                    return row
                }
                else{
                    const beforeVal = [...row].splice(0, colNum);
                    const afterVal = [...row].splice(colNum+1);
                    const newRow = [...beforeVal, newVal,...afterVal]
                    return newRow;
                }
                
        }
        // console.log('CURRENT Sheet', currentSheet)
        return {currentSheet, getVal, changeColVal}
    }
    catch(err: any){
        console.log({err})

    }
}

export const stringToArray = (text: string)=> {
    // console.log("text: ", text)
    const currentSheet: string[][] = [];

  
    const rows = text.split('\r\n')
    // console.log({rows})
    let last = false;
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 


    const setFinder = (headerName: string)=>{
        // console.log(currentSheet[0])
        const headerPosition = currentSheet[0].map(heads=>{
            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
        // console.log({headerPosition});
        return headerPosition
       
    }
    const getVal = (row: number, col: string) => {
        const colNum = setFinder(col);
        if(colNum==null||colNum===-1){
            // console.log('NO COLUMN FOUND')
            return ''
        }
        // console.log(col, colNum, currentSheet[row][colNum])
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    
    const changeColVal = (row: string[], col: string, newVal: string)=>{
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                console.log('NO COLUMN FOUND')
                return row
            }
            else{
                const beforeVal = [...row].splice(0, colNum);
                const afterVal = [...row].splice(colNum+1);
                const newRow = [...beforeVal, newVal,...afterVal]
                return newRow;
            }
          
    }
    // console.log('CURRENT Sheet', currentSheet)
    return {currentSheet, getVal, changeColVal}
}

export const csvFileToArray = (path: string, headerRow?: number)=> {
    const text = readFileSync(path, 'utf-8');
    const currentSheet: string[][] = [];
    const rows = text.split('\r\n')
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 
    const setFinder = (headerName: string)=>{
        // console.log(currentSheet[0])
        const headerPosition = currentSheet[headerRow!=null?headerRow:0].map(heads=>{
            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
        // console.log({headerPosition});
        return headerPosition
        
    }
    const getVal = (row: number, col: string) => {
        const colNum = setFinder(col);
        if(colNum==null||colNum===-1){
            // console.log('NO COLUMN FOUND')
            return ''
        }
        // console.log(col, colNum, currentSheet[row][colNum])
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    
    const changeColVal = (row: string[], col: string, newVal: string)=>{
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                console.log('NO COLUMN FOUND')
                return row
            }
            else{
                const beforeVal = [...row].splice(0, colNum);
                const afterVal = [...row].splice(colNum+1);
                const newRow = [...beforeVal, newVal,...afterVal]
                return newRow;
            }
            
    }
    // console.log('CURRENT Sheet', currentSheet)
    return {currentSheet, getVal, changeColVal}
}

export const arrayToCsv = (data: string[][], path?: string) => {
    const fileString = data.map(row =>{
        // console.log({row})
        return row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    }).join('\r\n');

    if(path!=null){
        writeFileSync(path, fileString, 'utf-8');
        return 'saved'
    }

    return fileString

}

const csvFileAsArray = (path: string) =>{
    const text = readFileSync(path, 'utf-8');
    const currentSheet: string[][] = [];
    const rows = text.split('\r\n')
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 
    return currentSheet
}

export const rowToCsvRowString = (row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    return `${dataString}`
}

export const addCsvData = (path: string, dataString: string) => {
    appendFileSync(path, dataString);
}

export const addHeaderRow = (path: string, row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    const rowString =  `${dataString}`;
    writeFileSync(path, rowString, 'utf-8');
}

export const addRow = (path: string, row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    const rowString =  `\r\n${dataString}`;
    appendFileSync(path, rowString);
}


export const addChunk = (path: string, rows: string[][]) => {
    const chunkString = rows.map(row=>{
        const dataString = row
            .map(v=>`${v}`)
            .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
            .map(v=>`"${v}"`)
            .join(',')
        return `\r\n${dataString}`;
    }).join('')
    appendFileSync(path, chunkString);
}

export const downloadFile = (content: string, filename: string, contentType: string) => {
    let blob = new Blob([content], {type: contentType});
    let url = URL.createObjectURL(blob);
    // let pom = document.createElement('a');
    // pom.href = url;
    // pom.setAttribute('download', filename);
    // pom.click()
}



const splitCsvStrings = (row: string) => {
    const noDbleQuotes = row.replace(/""/g, '-|-');
    // console.log('noDBLQs', noDbleQuotes)
    const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
    const newRow = noDbleQuotes.split(regX);
    // console.log("new ROWWWW", newRow);
    const fixedRow = newRow.map(rl=>{
        if(rl==null){
            return ""
        }
        return rl.replace(/\-\|\-/g, '"')
    });
    // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
    const fixedRow3 = fixedRow.map(rl=>{
        let string = rl;
        if(string.startsWith('"')){
            string = string.substring(1)
        }
        let endString = string;
        if(endString.endsWith('"')){
            endString = endString.substring(0, endString.length-1);
        }
        return endString
    })
    // const id = r ===0?'id':`${r}`;
    const dataRow = [...fixedRow3]
    if(dataRow[0]===""){
        dataRow.shift();
    }
    if(dataRow[dataRow.length-1]===""){
        dataRow.pop();
    }
    const noCommaCells = dataRow.filter(dr=>{
        return dr.trim()!==','
    })
    const fixUndefined = noCommaCells.map(dr=>{
        if(dr!=null) return dr
        return ""
    })
    // currentSheet.push(fixUndefined);
    return fixUndefined;
}



export const arrayToXLSX = (data: any[][], name: string, path: string) => {

    const worksheet = [{
        name,
        data,
        options: {}
    }]


    const buffer = xlsx.build(worksheet);
    //@ts-ignore
    writeFileSync(path, buffer);
}
 