import { image } from 'image-downloader';

const exec = (params) => {
  const { list, get, update } = params.db;

  const baixarFotos = async ({ colecao, lista, idy }) => {
    if (idy >= lista.length) {
      console.log('Lista acabou');
      return;
    }

    const { registro, fotos } = lista[idy];

    if (fotos.filter(({ baixou }) => !baixou).length > 0) {
      console.log(colecao, registro, 'Verificando fotos');
      const i = await get({ colecao, registro });

      for (let idx = 0; idx < i.fotos.length; idx++) {
        const array = i.fotos[idx].url.split('/');
        const arquivo = array.pop();

        const { filename } = await image({
          url: i.fotos[idx].url,
          dest: `../../sites/palaciodosleiloes/fotos/${registro.leilao}-${registro.lote}-${arquivo}`
        });

        if (filename) {
          i.fotos[idx].baixou = true;
          i.fotos[idx].filename = filename;
        }
      }

      const atualizado = await update({ colecao, registro, set: { fotos: i.fotos } });
      console.log(colecao, registro, `Registro ${atualizado ? '' : 'não '}atualizado`);

      setTimeout(() => baixarFotos({ colecao, lista, idy: idy+1 }), 5000);
    } else {
      console.log(colecao, registro, 'Nenhuma foto para baixar');
      baixarFotos({ colecao, lista, idy: idy+1 })
    }

  };

  const fnc = async () => {
    const colecao = 'palacioDosLeiloes';
    const listaBanco = await list({ colecao, filtro: {
      encerrado: {$ne: true},
      fotos: {$exists: true}
    }});

    await baixarFotos({ colecao, lista: listaBanco, idy: 0 });

    // listaBanco.forEach(async ({ registro, fotos }) => {
    //   if (fotos.filter(({ baixou }) => !baixou).length > 0) {
    //     console.log(colecao, registro, 'Verificando fotos');
    //     const i = await get({ colecao, registro });

    //     for (let idx = 0; idx < i.fotos.length; idx++) {
    //       const array = i.fotos[idx].url.split('/');
    //       const arquivo = array.pop();

    //       const response = await image({
    //         url: i.fotos[idx].url,
    //         dest: `../../sites/palaciodosleiloes/fotos/${registro.leilao}-${registro.lote}-${arquivo}`
    //       });

    //       if (response.filename) {
    //         i.fotos[idx].baixou = response.filename;
    //       }
    //     }

    //     const atualizado = await update({ colecao, registro, set: { fotos } });
    //     console.log(colecao, registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
    //   } else {
    //     console.log(colecao, registro, 'Nenhuma foto para baixar');
    //   }
    // });
  };

  return fnc;
};

export default exec;