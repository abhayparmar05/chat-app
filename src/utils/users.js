const users = []
//add a new user
const adduser =  ({ id ,username , room})=>{
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            Error : 'Username and Room are Required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room=== room && user.username===username
    })

    //validate the userName
    if(existingUser){
        return{
            Error : 'Username is in Use!'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return{user}
}

//remove User
const removeUser = (id) =>{
    const index  = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//get spcifie user into 
const getUser=(id)=>{
    return users.find((user)=> user.id == id)   
}

//get user from 1 room belong
const getUsersInRoom  = (room)=>{
    return users.filter((user)=> user.room == room)
}

module.exports = {
    adduser,
    removeUser,
    getUser,
    getUsersInRoom
}