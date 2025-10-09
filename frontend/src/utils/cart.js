/**
 * Formatar valor monetário para Real Brasileiro
 * @param {number|string} value - Valor a ser formatado
 * @returns {string} - Valor formatado em BRL
 */
export function formatCurrency(value) {
  if (value == null) return 'R$ 0,00';
  
  try {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  } catch (error) {
    console.error('Erro ao formatar valor monetário:', error);
    return 'R$ 0,00';
  }
}

/**
 * Calcular valor total de um item (preço * quantidade)
 * @param {number|string} preco - Preço unitário
 * @param {number} quantidade - Quantidade
 * @returns {number} - Valor total
 */
export function calculateItemTotal(preco, quantidade) {
  try {
    const precoNum = typeof preco === 'number' ? preco : parseFloat(preco) || 0;
    return precoNum * quantidade;
  } catch (error) {
    console.error('Erro ao calcular total do item:', error);
    return 0;
  }
}

/**
 * Verificar se há estoque suficiente
 * @param {number} quantidadeDesejada - Quantidade desejada
 * @param {number} quantidadeEstoque - Quantidade em estoque
 * @returns {boolean} - Se há estoque suficiente
 */
export function hasStockAvailable(quantidadeDesejada, quantidadeEstoque) {
  return quantidadeDesejada <= quantidadeEstoque;
}

/**
 * Calcular frete baseado no subtotal
 * @param {number} subtotal - Valor do subtotal
 * @param {string} tipoFrete - Tipo do frete ('padrao', 'expresso', 'gratis')
 * @returns {object} - Objeto com valor do frete e tipo
 */
export function calculateShipping(subtotal, tipoFrete = 'padrao') {
  // Frete grátis para compras acima de R$ 200
  if (subtotal >= 200) {
    return {
      valor: 0,
      tipo: 'gratis',
      descricao: 'Frete Grátis',
      prazo: '5-7 dias úteis'
    };
  }

  switch (tipoFrete) {
    case 'expresso':
      return {
        valor: 25.00,
        tipo: 'expresso',
        descricao: 'Frete Expresso',
        prazo: '1-2 dias úteis'
      };
    case 'padrao':
    default:
      return {
        valor: 15.00,
        tipo: 'padrao',
        descricao: 'Frete Padrão',
        prazo: '3-5 dias úteis'
      };
  }
}

/**
 * Calcular total final (subtotal + frete)
 * @param {number} subtotal - Valor do subtotal
 * @param {number} valorFrete - Valor do frete
 * @returns {number} - Total final
 */
export function calculateTotal(subtotal, valorFrete) {
  return subtotal + valorFrete;
}