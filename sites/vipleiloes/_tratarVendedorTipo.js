const tratarVendedorTipo = (val) => {
  if (!val) {
    return null;
  }

  const vendedor = val.toUpperCase();
  
  if (vendedor.includes('SEGURO')) {
    return 'seguradora';
  }

  if (vendedor.includes('BANCO') || vendedor.includes('FINANC') || vendedor.includes('CONSORCIO') || vendedor.includes('CONSÓRCIO') || vendedor.includes('CAIXA ECONOMICA') || vendedor.includes('BRADESCO') || vendedor.includes('SICREDI') || vendedor.includes('ITAPEVA') || vendedor.includes('AUTO LOANS') || vendedor.includes('FINAMAX')) {
    return 'financeira';
  }

  if (vendedor.includes('CTTU') || vendedor.includes('PRF') || vendedor.includes('DETRAN') || vendedor.includes('SMDT') || vendedor.includes('SEC DO TRÂN')) {
    return 'rodoviaria';
  }

  if (vendedor.includes('UFPI') || vendedor.includes('EQUATORIAL ENERGIA') || vendedor.includes('GRUPO EQUATORIAL') || vendedor.includes('PREF') || vendedor.includes('IGA') || vendedor.includes('DPL CONSTRUÇÕES') || vendedor.includes('FÓRMULA ZERO')) {
    return 'frota';
  }

  if (vendedor.includes('LOCADORA')) {
    return 'locadora';
  }

  if (vendedor.includes('PARTICULAR')) {
    return 'particular';
  }

  if (vendedor.includes('NÃO INFORMADO')) {
    return null;
  }

  return vendedor;
}

export default tratarVendedorTipo;
