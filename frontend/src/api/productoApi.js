import apiClient from "."


const getProductosPorFiltro = async (filtroProductos) => {
    //deberia validar que esta llegando??
    return apiClient.get('/producto/getProductosPorFiltro', {params: filtroProductos})
}

const getProducto = async (idProducto) => {
    return apiClient.get(`/producto/${idProducto}`)
}



export default {
    getProductosPorFiltro: getProductosPorFiltro,
    getProducto: getProducto,
}
