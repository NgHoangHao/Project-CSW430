import api from "../lib/axios"
export const userService ={
    forgotPass: async(email:string,newPass:string,confirmPass:string) =>{
        const res = await api.post('/user/forget-pass',{email,newPass,confirmPass});
    },
    verifyForgetPass : async(email:string,clientOtp:string) =>{
        const res = await api.post('/user/verify-forget',{email,clientOtp});
    }
}