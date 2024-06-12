/**
 * INFORMAÇÕES DE INTERFACE PARA REQUISIÇÃO DE INÍCIO DE TRANSAÇÃO
 */

export interface IStartTransaction {
    /**
     * ENDEREÇO IP - Nome ou endereço do servidor SiTef
     * (EM NOTAÇÃO ".")
     * 
     * EXEMPLO: 192.168.0.200
     */
    sitefIp: string;
    /**
     * IDENTIFICAÇÃO DA LOJA - Perante a rede de estabelecimento comercial
     * 
     * EXEMPLO: 12345678
     */
    storeId: number;
    /**
     * IDENTIFICAÇÃO DO CAIXA (PDV) - Número interno do caixa na loja
     * (Formato XXnnnnnn onde XX corresponde a 2 (dois) caracteres alfabéticos 
     * e nnnnnn são 6 (seis) dígitos quaisquer desde que o número restante não
     * sobreponha a faixa 000900 a 000999 que é reservada para uso pelo SiTef)
     * 
     * EXEMPLO: AB123456
     */
    terminalId: string;
    /**
     * FORMA DE PAGAMENTO - Conforme tabela "Códigos de Funções"
     * 
     * 1 - Cartão de Débito
     * 2 - Cheque
     * 3 - Dinheiro
     * 4 - Cartão de Crédito ou Múltiplas Formas de Pagamento
     */
    functionalId: number;
    /**
     * VALOR A SER PAGO - Valor da transação
     * (Valor decimal contendo o separador ",". Deve ser passado com 2 (duas)
     * casas decimais após a vírgula. Em caso da operação não ter valor definido
     * a priori (como por exemplo recarga pré-pago) esse campo deve vir vazio)
     * 
     * EXEMPLO: 10,00
     */
    trnAmount: number;
    /**
     * NÚMERO CUPOM FISCAL - Número do Cupom Fiscal correspondente à venda
     * 
     * EXEMPLO: 1234
     */
    taxInvoiceNumber: number;
    /**
     * DATA FISCAL - Data fiscal no formato AAAAMMDD
     * 
     * EXEMPLO: 20240612
     */
    taxInvoiceDate: number;
    /**
     * HORA FISCAL - Hora fiscal no formato HHMMSS
     * 
     * EXEMPLO: 145036
     */
    taxInvoiceTime: number;
    /**
     * OPERADOR DE CAIXA - Identificação do operador de caixa
     * 
     * EXEMPLO: Terminal01
     */
    cashierOperator: string;
    /**
     * PARÂMETROS ADICIONAIS - Permite que o aplicativo limite 
     * o tipo de meio de pagamento. Ele é opcional e pode ser passado 
     * vazio (“”). Quando esse campo for utilizado a CliSiTef irá 
     * limitar os menus de navegação apenas aos códigos não presentes na lista.
     */
    trnAdditionalParameters: string;
    /**
     * PARÂMETROS ADICIONAIS - Parâmetros adicionais para a configuração 
     * da CliSiTef (função ConfiguraIntSiTefInterativo).
     */
    trnInitParameters: string;
}