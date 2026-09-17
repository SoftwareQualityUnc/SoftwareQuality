import apiClient from "."


const getProductosPorFiltro = async (filtroProductos) => {
    //deberia validar que esta llegando??
    return apiClient.get('/producto/getProductosPorFiltro', {params: filtroProductos})
}




export default {
    getProductosPorFiltro: getProductosPorFiltro,
}