module.exports = class UserDto{
    email;
    id;

    constructor(model){
        this.email = model[0].email;
        this.id = model[0].id
    }
}