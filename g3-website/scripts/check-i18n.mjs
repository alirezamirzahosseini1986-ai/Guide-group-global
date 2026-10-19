import fs from 'node:fs';
const langs=['fa','en','ar'], dir='src/content';
const shape=(v)=>Array.isArray(v)?(v.length&&typeof v[0]==='object'?[shape(v[0]),v.length]:['str',v.length]):(v&&typeof v==='object')?Object.fromEntries(Object.keys(v).sort().map(k=>[k,shape(v[k])])):typeof v;
let errs=0;
for(const f of fs.readdirSync(`${dir}/fa`)){
  const base=JSON.stringify(shape(JSON.parse(fs.readFileSync(`${dir}/fa/${f}`))));
  for(const l of langs.slice(1)){
    const p=`${dir}/${l}/${f}`;
    if(!fs.existsSync(p)){console.error('MISSING',p);errs++;continue}
    const s=JSON.stringify(shape(JSON.parse(fs.readFileSync(p))));
    if(s!==base){console.error('SHAPE MISMATCH',p);errs++}
  }
  // empty strings check (except optional fields)
  const walk=(o,path,l)=>{for(const[k,v]of Object.entries(o)){const pp=path+'.'+k;if(typeof v==='string'&&!v&&!['video','logo','suffix','telegram','youtube','linkedin'].includes(k))console.warn('EMPTY',l,pp);else if(v&&typeof v==='object')walk(v,pp,l)}};
  for(const l of langs) walk(JSON.parse(fs.readFileSync(`${dir}/${l}/${f}`)),f,l);
}
console.log(errs?`i18n: ${errs} problem(s)`:'i18n: all 3 languages share identical structure ✓');
process.exit(errs?1:0);
