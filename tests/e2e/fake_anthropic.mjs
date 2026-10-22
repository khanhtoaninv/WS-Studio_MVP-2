// Máy chủ giả Claude API cho kiểm thử: trả JSON hợp lệ theo lược đồ được gửi lên. FAIL=1 thì trả 500.
import http from 'node:http';
const port = Number(process.env.FAKE_PORT || 8790);
const log = [];
const sample = { stem:'I ___ get up at six.', options:['always','teeth','lunch'], correctIndex:0, explanation:'"always" is an adverb of frequency.' };
http.createServer((req, res) => {
  let raw=''; req.on('data', c => raw += c); req.on('end', () => {
    if(req.url === '/__log'){ res.end(JSON.stringify(log)); return; }
    const b = JSON.parse(raw || '{}'); log.push({ url:req.url, beta:req.headers['anthropic-beta'], model:b.model, fallbacks:b.fallbacks, effort:b.output_config?.effort, hasSchema:!!b.output_config?.format?.schema, prompt:b.messages?.[0]?.content?.slice(0,4000) });
    if(process.env.FAIL){ res.writeHead(500, {'content-type':'application/json'}); res.end(JSON.stringify({type:'error', error:{type:'api_error', message:'fake down'}})); return; }
    const isVariants = !b.output_config.format.schema.properties.title;
    const qs = [0,1,2,3].map(i => ({ ...sample, stem: ['I ___ get up at six.','She ___ has lunch at school.','We ___ watch TV in the evening.','He ___ goes to bed late.'][i] }));
    const out = isVariants ? { questions: qs.slice(0,3) } : { title:'Choose the word', instruction:'Choose the correct answer: A, B or C.', passage:'', wordBank:[], extraRight:[], questions: qs };
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ id:'msg_fake', type:'message', role:'assistant', model:b.model, stop_reason:'end_turn', content:[{type:'text', text:JSON.stringify(out)}], usage:{input_tokens:1,output_tokens:1} }));
  });
}).listen(port, () => console.log('fake anthropic on', port));
