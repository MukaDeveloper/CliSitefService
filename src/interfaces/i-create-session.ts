export interface ICreateSession {
  // #region Properties (4)

  /**
   * PARÂMETROS DE SESSÃO - Configuração de parâmetros de sessão
   */
  sessionParameters?: string;
  /**
   * ENDEREÇO IP - Nome ou endereço do servidor SiTef (EM NOTAÇÃO ".")
   *
   * EXEMPLO: 192.168.0.200
   */
  sitefIp: string;
  /**
   * IDENTIFICAÇÃO DA LOJA - Perante a rede de estabelecimento comercial
   *
   * EXEMPLO: 12345678
   */
  storeId: string;
  /**
   * IDENTIFICAÇÃO DO CAIXA (PDV) - Número interno do caixa na loja
   *
   * (Formato XXnnnnnn onde XX corresponde a 2 (dois) caracteres alfabéticos
   * e nnnnnn são 6 (seis) dígitos quaisquer desde que o número restante não
   * sobreponha a faixa 000900 a 000999 que é reservada para uso pelo SiTef)
   *
   * EXEMPLO: AB123456
   */
  terminalId: string;

  // #endregion Properties (4)
}
