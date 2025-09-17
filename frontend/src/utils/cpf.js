export function limparCPF(cpf){
  return (cpf||'').replace(/[^\d]/g,'');
}

export function validarCPF(cpf){
  cpf = limparCPF(cpf);
  if(!cpf || cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  const calc = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += parseInt(cpf[i]) * (base + 1 - i);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = calc(9);
  if (d1 !== parseInt(cpf[9])) return false;
  const d2 = calc(10);
  if (d2 !== parseInt(cpf[10])) return false;
  return true;
}

export function formatarCPF(cpf){
  cpf = limparCPF(cpf).slice(0,11);
  if(cpf.length<=3) return cpf;
  if(cpf.length<=6) return cpf.replace(/(\d{3})(\d+)/,'$1.$2');
  if(cpf.length<=9) return cpf.replace(/(\d{3})(\d{3})(\d+)/,'$1.$2.$3');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/,'$1.$2.$3-$4');
}
