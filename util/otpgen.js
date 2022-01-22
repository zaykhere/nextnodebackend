const otpGenerator = require('otp-generator');


class otpgen
{

    static async digits(length)
    {
        return otpGenerator.generate(length,{digits:true,alphabets:false,upperCase:false,specialChars:false});   
    }

    
    static async alphabets(length)
    {
        return otpGenerator.generate(length,{digits:false,alphabets:true,upperCase:false,specialChars:false});   
    }



}

module.exports = otpgen;



