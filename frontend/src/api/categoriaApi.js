import apiClient from "."


const getAll = async () => {
    return apiClient.get('/categoria/list')
}




export default {
    getAll: getAll,
}