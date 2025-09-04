import dotenv from 'dotenv';
import { setRunTime } from './helpers/setRunTime';
import { a4DataReader } from './controllers/a4';


dotenv.config();

setRunTime(a4DataReader, [{hour: 13, minute: 30, daily: true}], true)
