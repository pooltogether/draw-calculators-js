import { BigNumber, ethers, utils } from "ethers"
import { User } from "../../types"
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
    saveToFile(users, "users")
    return users
}

type Address = {
    address: string
}

export function generateAndSaveUserAddresses(numberOfUsers: number){
    let addresses : Address[] = []
    
    for(let i =0; i < numberOfUsers; i++){
        const randomAddress = ethers.Wallet.createRandom().address
        addresses.push({address:randomAddress})
    }

    saveToFile(addresses, "addresses")
}


function saveToFile(users: any[], fileName: string){
    const pathFileBase = `./simData`
    mkdirSync(pathFileBase, { recursive: true });
    writeFileSync(`${pathFileBase}/${fileName}.json`, JSON.stringify(users, null, 2), "utf8")
    console.log("saved to file")
}

export function readAddressesFromFile() : string[]{
    const file = readFileSync("./simData/addresses.json")
    
    return JSON.parse(file.toString())
}

export function readUsersFromFile(): User[]{
    const file = readFileSync("./simData/users.json")
    const fileUsers:any[] = JSON.parse(file.toString())

    // now convert to user type
    let users : User[] = []
    fileUsers.forEach((user)=>{
        users.push({
            address: user.address,
            balance: BigNumber.from(user.balance),
            pickIndices: [...new Array<number>(user.pickIndices.length).keys()].map((num)=> BigNumber.from(num))
        })
    })


    console.log(`read ${users.length} users from file`)
    return users
}

export function getRandomInt(max: number) : number {
    return Math.floor(Math.random() * max)
}
// todo: function that calculates/displays the uniformity of a user array
// calculates the occrance of each hex character in a position of the address
