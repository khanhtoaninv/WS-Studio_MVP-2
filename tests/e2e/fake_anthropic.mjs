// Máy chủ giả Claude, OpenAI/DeepSeek (chat/completions) và Gemini (generateContent) cho kiểm thử: trả JSON hợp lệ theo lược đồ được gửi lên. FAIL=1 thì trả 500.
import http from 'node:http';
const port = Number(process.env.FAKE_PORT || 8790);
const log = [];
const sample = { stem:'I ___ get up at six.', options:['always','teeth','lunch'], correctIndex:0, explanation:'"always" is an adverb of frequency.' };
http.createServer((req, res) => {
  let raw=''; req.on('data', c => raw += c); req.on('end', () => {
    if(req.url === '/__log'){ res.end(JSON.stringify(log)); return; }
    const b = JSON.parse(raw || '{}');
    const compat = req.url.endsWith('/chat/completions'), gem = req.url.includes(':generateContent');
    const text = compat ? b.messages?.[1]?.content : gem ? b.contents?.[0]?.parts?.[0]?.text : b.messages?.[0]?.content;
    log.push({ url:req.url, auth:req.headers.authorization || req.headers['x-goog-api-key'] || req.headers['x-api-key'], beta:req.headers['anthropic-beta'], model:b.model || req.url.match(/models\/([^:]+):/)?.[1], fallbacks:b.fallbacks, effort:b.output_config?.effort,
      hasSchema:!!b.output_config?.format?.schema || /JSON Schema:/.test(text || ''), json: b.response_format?.type || b.generationConfig?.responseMimeType, prompt:text?.slice(0,4000) });
    if(process.env.FAIL){ res.writeHead(compat ? 401 : 500, {'content-type':'application/json'}); res.end(JSON.stringify(compat ? {error:{message:'Incorrect API key'}} : {type:'error', error:{type:'api_error', message:'fake down'}})); return; }
    const schema = b.output_config?.format?.schema || (/JSON Schema:\n/.test(text || '') ? JSON.parse(text.split('JSON Schema:\n')[1]) : {properties:{}});
    const isPing = !!schema.properties.ok, isVariants = !isPing && !schema.properties.title;
    const qs = [0,1,2,3].map(i => ({ ...sample, stem: ['I ___ get up at six.','She ___ has lunch at school.','We ___ watch TV in the evening.','He ___ goes to bed late.'][i] }));
    const out = isPing ? { ok:true } : isVariants ? { questions: qs.slice(0,3) } : { title:'Choose the word', instruction:'Choose the correct answer: A, B or C.', passage:'', wordBank:[], extraRight:[], questions: qs };
    if(compat){ res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ choices:[{ finish_reason:'stop', message:{ content: JSON.stringify(out) } }] })); return; }
    if(gem){ res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ candidates:[{ finishReason:'STOP', content:{ parts:[{ text: JSON.stringify(out) }] } }] })); return; }
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ id:'msg_fake', type:'message', role:'assistant', model:b.model, stop_reason:'end_turn', content:[{type:'text', text:JSON.stringify(out)}], usage:{input_tokens:1,output_tokens:1} }));
  });
}).listen(port, () => console.log('fake anthropic on', port));
