const tratarDataHora = (val) => {
  let obj = { string: val };
  if (val.length === 8 && val.includes('/')) {
    const array = val.split('/');
    const data = `20${array[2]}-${array[1]}-${array[0]}`;

    obj.date = new Date(data);
    obj.time = obj.date.getTime();
  } else if ((val.length === 19 || val.length === 17) && val.includes('/') && val.includes(':')) {
    const array = val.split(' ');
    const arrayData = array[0].split('/');
    const data = `${arrayData[2].length == 2 ? '20' : ''}${arrayData[2]}-${arrayData[1]}-${arrayData[0]}`;
    const hora = array[1];

    obj.date = new Date(`${data}T${hora}`);
    obj.time = obj.date.getTime();
  }

  return obj;
};

export default tratarDataHora;
