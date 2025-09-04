type Time = {
    hour: number,
    minute?: number,
    second?: number,
    hourly?: boolean,
    daily?: boolean,
    weekly?: string,
    monthly?: string,
    yearly?: string
}

type Func = ()=>Promise<void>|void
export const setRunTime = (func: Func, times: Time[], immediate?: boolean) => {
    if(immediate!=null){
        if(immediate){ 
            console.log({immediate})
            func();
        }
    }
    for(let tm =0;tm<times.length;tm++){
        const time = times[tm];
        const startDate = new Date();
        const sStr = `${startDate.getMonth()+1}/${startDate.getDate()}/${startDate.getFullYear()}`
        let fDate = new Date(sStr);
        const curHour = startDate.getHours();
        const curMinute = startDate.getMinutes();
        if(curHour>time.hour){
            console.log('Not passed')
            const tomorrowDate = new Date(startDate.getTime()+(60000*60*24));
            fDate = new Date(`${tomorrowDate.getMonth()+1}/${tomorrowDate.getDate()}/${tomorrowDate.getFullYear()}`);
        }
        if(curHour===time.hour){
            console.log('Not passed')
            const tomorrowDate = new Date(startDate.getTime()+(60000*60*24));
            if(time.minute!=null){
                console.log('minNot Null')
                if(curMinute>time.minute){
                    console.log('Not passed2')
                    fDate = new Date(`${tomorrowDate.getMonth()+1}/${tomorrowDate.getDate()}/${tomorrowDate.getFullYear()}`);
                }
            }
            else{
                fDate = new Date(`${tomorrowDate.getMonth()+1}/${tomorrowDate.getDate()}/${tomorrowDate.getFullYear()}`);
            }
        }
        fDate.setHours(time.hour)
        if(time.minute!=null){
            fDate.setMinutes(time.minute)
        }
        if(time.second!=null){
            fDate.setSeconds(time.second);
        }
        console.log({fDate})


        const fDateInMS = fDate.getTime();
        const currTime = new Date().getTime();
        const timeTillFDate = fDateInMS-currTime;
        console.log({timeTillFDate})
        setTimeout(()=>{
            console.log('Running')
            func();
            if(time.hourly!=null&&time.hourly){
                setInterval(()=>{
                    func()
                }, 60000*60)
            }
            if(time.daily!=null&&time.daily){
                setInterval(()=>{
                    func()
                }, 60000*60*24)
            }
            if(time.weekly!=null&&time.weekly){
                setInterval(()=>{
                    func()
                }, 60000*60*24*7)
            }
            // if(time.monthly!=null&&time.monthly){
            //     const getMonthFromNow = new Date()
            //     const nextMonthDateStr = `${getMonthFromNow.getMonth()===11?'1':getMonthFromNow.getMonth()+2}/${getMonthFromNow.getDate()}/
            //     setInterval(()=>{
            //         func()
            //     }, 60000*60*24)
            // }
            if(time.yearly!=null&&time.yearly){
                const getYearFromNow = new Date()
                const dayDate = getYearFromNow.getMonth()===1&&getYearFromNow.getDate()===29?28:getYearFromNow.getDate();
                const nextYearDateStr = `${getYearFromNow.getMonth()+1}/${dayDate}/${getYearFromNow.getFullYear()+1}`
                const nextYearDate = new Date(nextYearDateStr);
                nextYearDate.setHours(time.hour);
                if(time.minute!=null){
                    nextYearDate.setMinutes(time.minute);
                }
                if(time.second!=null){
                    nextYearDate.setMinutes(time.second);
                }
                setInterval(()=>{
                    func()
                }, nextYearDate.getTime())
            }
        }, timeTillFDate<0?0:timeTillFDate)
    }
    
}