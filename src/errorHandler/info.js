export const generateProductErrorInfo = (product) => {
	return `Error al generar producto. 
	Revisar los siguientes items: ${product.title} 
	${product.description} 
	${product.price} 
	${product.code} 
	${product.stock} 
	${product.category}`;
}