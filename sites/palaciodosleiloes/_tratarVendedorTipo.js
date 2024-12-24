const tratarVendedorTipo = (vendedor, tipo) => {

  if (vendedor) {
    const vendedorUp = vendedor.toUpperCase();

    if (vendedorUp.includes('BANCO')) {
      return 'financeira';
    }

    if (vendedorUp.includes('HPE AUTOMOTORES') || vendedorUp.includes('AUTO VENDE')) {
      return 'loja';
    }

    if (vendedorUp.includes('UNIDAS') || vendedorUp.includes('LOCALIZA')) {
      return 'locadora';
    }
  }

  if (tipo) {
    const tipoUp = tipo.toUpperCase();
    
    if (tipoUp.includes('BANCO')) {
      return 'financeira';
    }

    if (tipoUp.includes('EMPRESA')) {
      return 'frota';
    }

    return tipoUp;
  }

  return null;
}

export default tratarVendedorTipo;
