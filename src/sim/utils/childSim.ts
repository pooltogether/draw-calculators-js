// takes {prizePeriod, winningRandomNumer, users}
import { BigNumber } from 'ethers';
import { Draw, DrawResults, DrawSettings, User, UserDrawResult } from '../../types';
import { runTsunamiDrawCalculatorForSingleDraw } from '../../tsunamiDrawCalculator';
import { Map } from 'immutable';

const parsedProcessArgs = JSON.parse(process.argv[2]);

const users: User[] = parsedProcessArgs.users;
const currentPrizePeriod = parsedProcessArgs.prizePeriod;
const draw: Draw = parsedProcessArgs.draw;
const drawSettings: DrawSettings = parsedProcessArgs.drawSettings;

function runDrawCalculator() {
    let drawResults = Map<string, Array<UserDrawResult>>();
    let userResults = Map<string, Array<UserDrawResult>>();

    users.forEach((user) => {
        // console.log("running for user with address: ", user.address)
        const userResultThisRun: DrawResults = runTsunamiDrawCalculatorForSingleDraw(
            drawSettings,
            draw,
            user,
        );

        // only populate with winning values
        if (userResultThisRun.totalValue.gt(BigNumber.from(0))) {
            const userDrawResultThisRun: UserDrawResult = {
                user,
                drawResult: userResultThisRun,
            };

            // record into draw mapping
            addResultToMap(user.address, userDrawResultThisRun, userResults);
            addResultToMap(currentPrizePeriod, userDrawResultThisRun, drawResults);
        }
    });

    (process as any).send(JSON.stringify([drawResults, userResults]));
}
runDrawCalculator();

function addResultToMap(key: string, value: UserDrawResult, map: Map<string, UserDrawResult[]>) {
    let currentValues: UserDrawResult[] | undefined = map.get(key);

    if (!currentValues) {
        currentValues = new Array<UserDrawResult>();
    }
    currentValues.push(value);
    map.set(key, currentValues);
}
