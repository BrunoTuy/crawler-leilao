const tratarDataHora = (val) => {
  const valSplit = val.split('\n');
  const data = valSplit[0].split('(')[0];
  const hora = valSplit[1].replace(/hs/g, '').trim();
  const obj = { string: `${data} ${hora}` };
  const splitData = data.trim().split('/');
  const dataInt = `${splitData[2]}-${splitData[1]}-${splitData[0]}`;

  obj.date = new Date(`${dataInt}T${hora}:00`);
  obj.time = obj.date.getTime();

  return obj;
};

export default tratarDataHora;
