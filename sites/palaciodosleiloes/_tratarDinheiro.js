const tratarDinheiro = (val) => {
  const valStr = val.replace('.', '').replace(',', '.');

  return isNaN(valStr) ? val : Number(valStr);
}

export default tratarDinheiro;
