import { BigNumber, ethers, utils } from "ethers"
import { User } from "../../types/types"
import {writeFileSync, readFileSync, mkdirSync} from "fs"

export function createRandomUsersSameBalance(numberOfUsers: number, balancePerUser: BigNumber, _picks: BigNumber[]){
    console.log(`creating random address's for ${numberOfUsers} users..`)

    let users : User[] = []

    for(let i =0; i < numberOfUsers; i++){
        // console.log(ethers.Wallet.createRandom().address)
        const randomAddress = ethers.Wallet.createRandom().address
        // console.log(`user no. ${i} setting address as ${randomAddress}`)
        users.push({
            address: randomAddress,
            balance: balancePerUser,
            pickIndices: _picks
        })
        
    }
    console.log("saving to file..")
    saveUsersToFile(users)
    return users
}

function saveUsersToFile(users: User[]){
    const pathFileBase = `./simData`
    mkdirSync(pathFileBase, { recursive: true });
    writeFileSync(`${pathFileBase}/users.json`, JSON.stringify(users, null, 2), "utf8")
    console.log("saved to file")
}

export function readUsersFromFile(): User[]{
    const file = readFileSync("./simData/users.json")
    const users:User[] = JSON.parse(file.toString())
    console.log("read users from file")
    return users
}


// function createRandomUsersRangeBalance(numberOfUsers: number, upperBalanceRange: BigNumber, pickCost: BigNumber){
//     // get random balance between range
   
//     const numberOfPicks = balancePerUser.div(pickCost)
//     const _picks = [...new Array<number>(numberOfPicks.toNumber()).keys()].map((num)=> BigNumber.from(num))
     

//     const users : User[] = new Array<User>(numberOfUsers).fill({
//         address: "",
//         balance: 
//         pickIndices: _picks
//     })
//     console.log("creating random address for users..")
//     users.forEach((user)=>{
//         user.address = ethers.Wallet.createRandom().address

//         user.balance = utils.parseEther(getRandomInt(utils.formatEther(upperBalanceRange).toNumber())
//     })

//     return users
// }

// function getRandomInt(max: number) : string {
//     return Math.floor(Math.random() * max).toString();
//   }