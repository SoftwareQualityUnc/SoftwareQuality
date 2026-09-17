import apiClient from "."


const getAll = async () => {
    return apiClient.get('/subCategoria/list')
}




export default {
    getAll: getAll,
}