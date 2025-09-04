export const removeDblSpace: (str: string)=>string = (str: string) => {
    if(str.includes('  ')){
        return removeDblSpace(str.replace(/\s\s/g,' '));
    }
    return str
}

export const compareString = (str: string) => {
    return str.toLowerCase().trim()
}