/* ============ SEED DATA (curricula, themes, standards, layouts, users) ============ */
import { WS } from '../ws.js';
const V = (w,pos,vi,emoji,def)=>({w,pos,vi,emoji:emoji||'',def:def||''});

WS.FUNCTION_WORDS = ('a an the is are am be been this that these those my your his her its our their i you he she it we they me him us them '+
 'and or but so in on at to of with for from by up down out about into over after before not no yes do does did don\'t doesn\'t isn\'t aren\'t '+
 'what who where when why how which there here have has haven\'t hasn\'t can can\'t very too also some any many much one two three four five six seven eight nine ten '+
 'eleven twelve first o\'clock half past every all a lot of like then just only again please thank thanks name names i\'m it\'s he\'s she\'s they\'re we\'re you\'re let\'s '+
 'ok okay hello hi goodbye bye mr mrs ms red blue green yellow black white big small new old good nice now today day time').split(/\s+/);

WS.USERS = [
  {id:'lan',  name:'Lan',  full:'Nguyễn Thị Lan', role:'l1', color:'#2D5BD0'},
  {id:'minh', name:'Minh', full:'Trần Văn Minh', role:'l1', color:'#0B7A6B'},
  {id:'ha',   name:'Hà',   full:'Lê Thu Hà', role:'l2', color:'#B5462E'},
  {id:'quang',name:'Quang',full:'Phạm Quang', role:'l2', color:'#7A4FC4'},
  {id:'thu',  name:'Thu',  full:'Đỗ Minh Thu', role:'admin', color:'#4A5466'}
];
WS.ROLE_LABEL = {l1:'Cấp 1 · Giáo viên soạn', l2:'Cấp 2 · Quản lý duyệt', admin:'Admin · Quản trị hệ thống'};
WS.ROLE_SHORT = {l1:'Cấp 1', l2:'Cấp 2', admin:'Admin'};

WS.TYPES = {
  mcq:{label:'Trắc nghiệm', icon:'◉', en:'Multiple choice'},
  fill_blank:{label:'Điền từ', icon:'▁', en:'Fill in the blank'},
  matching:{label:'Nối', icon:'⇄', en:'Matching'},
  ordering:{label:'Sắp xếp', icon:'⇅', en:'Ordering'},
  tfng:{label:'Đúng/Sai/Không có thông tin', icon:'T/F', en:'True / False / Not given'},
  cloze_mcq:{label:'Điền từ trắc nghiệm theo đoạn', icon:'¶', en:'Cloze'},
  word_form:{label:'Biến đổi từ', icon:'Aa', en:'Word formation'},
  rewrite:{label:'Viết lại câu', icon:'↺', en:'Sentence transformation'},
  short_answer:{label:'Trả lời ngắn', icon:'✎', en:'Short answer'}
};
WS.TYPE_ORDER = ['matching','mcq','fill_blank','ordering','tfng','cloze_mcq','word_form','rewrite','short_answer'];

WS.STANDARDS = [
  {id:'STD-MCQ', type:'mcq', version:'1.2', minQ:3, maxQ:10, maxWords:18, opts:[3,4], requireAnswer:true, requireExpl:false},
  {id:'STD-FIL', type:'fill_blank', version:'1.1', minQ:3, maxQ:10, maxWords:18, requireAnswer:true},
  {id:'STD-MAT', type:'matching', version:'1.0', minQ:4, maxQ:8, maxWords:6, maxDistractors:2, requireAnswer:true},
  {id:'STD-ORD', type:'ordering', version:'1.0', minQ:3, maxQ:6, maxWords:12, requireAnswer:true},
  {id:'STD-TFN', type:'tfng', version:'1.1', minQ:3, maxQ:8, maxWords:20, requirePassage:true, requireAnswer:true},
  {id:'STD-CLZ', type:'cloze_mcq', version:'1.0', minQ:4, maxQ:8, maxWords:120, opts:[3,3], requirePassage:true, requireAnswer:true},
  {id:'STD-WDF', type:'word_form', version:'1.0', minQ:4, maxQ:10, maxWords:18, requireAnswer:true},
  {id:'STD-RWR', type:'rewrite', version:'1.0', minQ:3, maxQ:6, maxWords:20, requireAnswer:true},
  {id:'STD-SHA', type:'short_answer', version:'1.0', minQ:3, maxQ:8, maxWords:18, requireAnswer:true}
];

WS.RULES = [
  ['V01','Số câu nằm trong khoảng của tiêu chuẩn','e','Phiếu cần đủ lượng luyện tập nhưng không quá tải học sinh.'],
  ['V02','Đủ trường bắt buộc của loại bài','e','Thiếu đề, lựa chọn hoặc đoạn văn thì học sinh không làm được.'],
  ['V03','Có đáp án khi loại bài yêu cầu','e','Giáo viên cần đáp án để chữa bài.'],
  ['V04','Trắc nghiệm: đúng 1 đáp án đúng, lựa chọn không trùng, 3–4 lựa chọn','e','Câu có hai đáp án đúng hoặc lựa chọn trùng làm học sinh rối.'],
  ['V05','Số chỗ trống khớp số đáp án','e','Mỗi chỗ trống phải có đáp án tương ứng.'],
  ['V06','Nối: ghép 1–1, không trùng','e','Một mục chỉ được nối với đúng một mục.'],
  ['V07','Sắp xếp: thứ tự đã xáo khác thứ tự đúng','e','Nếu chưa xáo thì không còn là bài sắp xếp.'],
  ['V08','Từ ngoài phạm vi từ vựng của lesson','w','Học sinh chưa học từ này nên dễ bí.'],
  ['V09','Từ/cấu trúc thuộc danh sách cấm hoặc chưa học','w','Cấu trúc chưa dạy làm sai mục tiêu lesson.'],
  ['V10','Câu dài hơn mức khuyến nghị','w','Câu quá dài tăng tải đọc với level này.'],
  ['V11','Câu trùng hoặc gần giống trong cùng bài','w','Câu lặp làm giảm giá trị luyện tập.'],
  ['V12','Đáp án có thể mơ hồ','w','Học sinh có thể tranh luận nhiều đáp án.'],
  ['V13','Nội dung không phù hợp lứa tuổi','e','An toàn cho học sinh là bắt buộc.'],
  ['V14','Thiếu hoặc quá dài hướng dẫn','w','Hướng dẫn ngắn, rõ giúp học sinh tự làm.'],
  ['V15','Ảnh thiếu alt text, audio thiếu transcript','w','Cần cho khả năng tiếp cận và cho giáo viên đọc lại.'],
  ['V16','Ngữ cảnh lệch khỏi chủ đề của unit','w','Bài nên bám chủ đề đang học.'],
  ['V17','Độ khó vượt trần của level','e','Câu quá dài hoặc quá trừu tượng so với level.']
];
WS.CRITERIA = [
  {k:'src', label:'Bám sát nguồn', rules:['V08','V09'], note:'Từ và cấu trúc lấy từ học liệu lesson'},
  {k:'lvl', label:'Phù hợp level', rules:['V08','V10','V17'], note:'Độ dài và độ khó hợp level'},
  {k:'typ', label:'Đúng loại bài', rules:['V01','V02','V04','V05','V06','V07'], note:'Cấu trúc đúng khuôn loại bài'},
  {k:'obj', label:'Đúng mục tiêu', rules:['V09','V11','V14','V16'], note:'Phục vụ mục tiêu và chủ đề lesson'},
  {k:'ans', label:'Đáp án rõ ràng', rules:['V03','V04','V12'], note:'Đáp án có, đúng và không mơ hồ'},
  {k:'saf', label:'An toàn', rules:['V13'], note:'Phù hợp lứa tuổi'}
];
WS.UNSAFE = ['kill','killed','blood','gun','guns','drunk','beer','wine','sexy','hate','stupid','die','dead','cigarette','knife','bomb'];

WS.LAYOUTS = [
  {id:'L1', name:'Một cột', when:'Mọi bài, chạy một mạch từ trên xuống', cols:1},
  {id:'L2', name:'Một cột kèm cột ảnh', when:'Bài có ảnh minh họa', cols:1, image:true},
  {id:'L3', name:'Đoạn văn trái, câu hỏi phải', when:'Bài đọc hiểu dài, nhiều câu', cols:2, passage:true},
  {id:'L4', name:'Hai cột đều', when:'Bài nhiều câu ngắn (điền từ, nối từ)', cols:2},
  {id:'L5', name:'Ảnh trên, câu dưới', when:'Bài nhìn tranh: tranh lớn đầu bài, câu hỏi bên dưới', cols:1, image:true},
  {id:'L6', name:'Lưới thẻ', when:'Câu rất ngắn dạng thẻ: nối tranh với từ, khoanh chọn, đúng/sai', cols:3, types:['mcq','matching','fill_blank','word_form','tfng']}
];
WS.LAYOUT_DEFAULTS = {mcq:'L1', fill_blank:'L4', matching:'L1', ordering:'L1', tfng:'L3', cloze_mcq:'L3', word_form:'L4', rewrite:'L1', short_answer:'L3'};

WS.THEMES = [
  {id:'space', name:'Space Explorers', emoji:'🚀', age:'8–11', levels:['Pre-A1','A1','A2'], active:true,
   desc:'Một trạm vũ trụ nơi các bạn nhỏ làm phi hành gia tập sự.',
   plot:'Đội phi hành gia tập sự trải qua một ngày trên trạm vũ trụ: thức dậy, tập luyện, sửa robot và ngắm Trái Đất.',
   chars:[{n:'Zed',g:'m',role:'phi công'},{n:'Mia',g:'f',role:'kỹ sư'},{n:'Bolt',g:'m',role:'robot'}],
   places:['bảng điều khiển','phòng ăn','khoang ngủ'], avoid:['bạo lực','nội dung đáng sợ'], hue:232},
  {id:'chefs', name:'Little Chefs', emoji:'🧑‍🍳', age:'6–9', levels:['Pre-A1','A1'], active:true,
   desc:'Một lớp học nấu ăn vui nhộn trong căn bếp nhỏ.',
   plot:'Các đầu bếp nhí chuẩn bị bữa tiệc cho cả lớp, chọn món mình thích và mời bạn bè.',
   chars:[{n:'Leo',g:'m',role:'đầu bếp nhí'},{n:'Rosa',g:'f',role:'đầu bếp nhí'},{n:'Pip',g:'m',role:'chú mèo'}],
   places:['căn bếp','chợ','bàn tiệc'], avoid:['đồ uống có cồn','dao sắc'], hue:28},
  {id:'jungle', name:'Jungle Friends', emoji:'🌿', age:'6–8', levels:['Pre-A1','A1'], active:true,
   desc:'Những người bạn động vật trong khu rừng xanh.',
   plot:'Kiki và Momo đi khắp khu rừng làm quen bạn mới.', chars:[{n:'Kiki',g:'f',role:'khỉ con'},{n:'Momo',g:'m',role:'voi con'}],
   places:['bờ sông','cây đại thụ'], avoid:['săn bắn'], hue:120},
  {id:'ocean', name:'Ocean Rangers', emoji:'🐬', age:'8–11', levels:['A1','A2'], active:false,
   desc:'Đội kiểm lâm biển bảo vệ rạn san hô.', plot:'Coral và Finn khảo sát rạn san hô.',
   chars:[{n:'Coral',g:'f',role:'kiểm lâm'},{n:'Finn',g:'m',role:'thợ lặn'}], places:['rạn san hô','tàu nghiên cứu'], avoid:['tai nạn'], hue:195},
  {id:'time', name:'Time Travellers', emoji:'⏳', age:'12–15', levels:['A2','B1'], active:true,
   desc:'Nhóm bạn du hành qua các thời kỳ lịch sử.',
   plot:'Giáo sư Ada cùng Max và Nova sửa cỗ máy thời gian, kể lại những chuyến đi.',
   chars:[{n:'Ada',g:'f',role:'giáo sư'},{n:'Max',g:'m',role:'học sinh'},{n:'Nova',g:'f',role:'học sinh'}],
   places:['phòng thí nghiệm','bảo tàng','nhà ga cổ'], avoid:['chiến tranh tàn khốc'], hue:280},
  {id:'detect', name:'City Detectives', emoji:'🔍', age:'12–15', levels:['A2','B1','B2'], active:true,
   desc:'Hai thám tử trẻ giải những bí ẩn nhỏ trong thành phố.',
   plot:'Iris và Sam lần theo manh mối để tìm món đồ bị thất lạc.', chars:[{n:'Iris',g:'f',role:'thám tử'},{n:'Sam',g:'m',role:'thám tử'}],
   places:['quảng trường','thư viện','nhà ga'], avoid:['tội phạm bạo lực'], hue:12}
];

/* ---------- curricula ---------- */
const L = (o)=>Object.assign({objectives:[],vocab:[],grammar:[],skills:['reading','writing'],topic:'',topicKeys:[],banned:[],passages:[],dialogue:'',
  sentenceBank:[],tfngBank:[],qaBank:[],wordFamilies:[],rewritePairs:[],imageKeywords:[],names:{},allowedExtra:[]},o);

const ex1 = {id:'ex1', name:'Explorers English 1', subject:'Tiếng Anh', age:'7–9', cefr:'Pre-A1 → A1', version:'2.1', status:'active',
 levels:[
  {id:'ex1-l1', name:'Level 1', cefr:'Pre-A1', soft:9, hard:13, units:[
   {id:'ex1-l1-u1', code:'U1', name:'My family', lessons:[
    L({id:'ex1-l1-u1-1', code:'1.1', name:'Family members',
     objectives:['Name family members','Say who someone is','Recognise this is / she is / he is'],
     vocab:[V('mother','n','mẹ','👩','a woman with a child'),V('father','n','bố','👨','a man with a child'),V('sister','n','chị/em gái','👧','a girl in your family'),
       V('brother','n','anh/em trai','👦','a boy in your family'),V('grandmother','n','bà','👵','your mother\'s mother'),V('grandfather','n','ông','👴','your father\'s father'),
       V('family','n','gia đình','👪','mother, father and children'),V('baby','n','em bé','👶','a very young child'),V('parents','n','bố mẹ','👫','mother and father'),
       V('love','v','yêu','❤️','like very much'),V('dog','n','con chó','🐶','a pet animal')],
     grammar:['This is my …','She is my … / He is my …'], topic:'family', topicKeys:['family','mother','father','sister','brother','baby'],
     banned:['although','would','have been','was','were'],
     passages:['This is my family. This is my mother. Her name is Mai. This is my father. His name is Tom. I have a sister and a brother. My sister is a baby. My grandmother and my grandfather are in my family too. I love my family.'],
     sentenceBank:['This is my mother.','This is my father.','She is my sister.','He is my brother.','She is my grandmother.','He is my grandfather.','This is my baby sister.','These are my parents.','This is my family.','Mai is my mother.','Tom is my father.','I love my family.'],
     tfngBank:[{s:'The mother\'s name is Mai.',a:'T'},{s:'The father\'s name is Ben.',a:'F'},{s:'The baby is a sister.',a:'T'},{s:'The family has a dog.',a:'NG'},{s:'The grandmother is in the family.',a:'T'},{s:'The brother is ten.',a:'NG'},{s:'There is no grandfather in the family.',a:'F'}],
     qaBank:[{q:'What is the mother\'s name?',a:['Mai','Her name is Mai']},{q:'What is the father\'s name?',a:['Tom','His name is Tom']},{q:'Who is the baby?',a:['the sister','my sister','sister']},{q:'Who loves the family?',a:['I','I do']}],
     imageKeywords:['family','mother','father','baby'], names:{Mai:'f',Tom:'m'}, allowedExtra:['mai','tom','ben','grandmother','grandfather']}),
    L({id:'ex1-l1-u1-2', code:'1.2', name:'He is / She is',
     objectives:['Describe a person with he/she','Use simple adjectives','Talk about friends'],
     vocab:[V('he','pron','anh ấy','🙋‍♂️','a boy or man'),V('she','pron','cô ấy','🙋‍♀️','a girl or woman'),V('boy','n','con trai','👦','a young male'),V('girl','n','con gái','👧','a young female'),
       V('tall','adj','cao','🦒','big from top to bottom'),V('short','adj','thấp','🐭','not tall'),V('happy','adj','vui','😀','feeling good'),V('sad','adj','buồn','😢','not happy'),
       V('friend','n','bạn','🤝','a person you like'),V('teacher','n','giáo viên','🧑‍🏫','a person who teaches'),V('funny','adj','vui tính','🤡','makes you laugh'),V('kind','adj','tốt bụng','🤗','nice to others')],
     grammar:['He is … / She is …','He is a … / She is a …'], topic:'friends', topicKeys:['friend','boy','girl','teacher','he','she'],
     banned:['although','was','were','would'],
     passages:['This is Ben. He is my friend. He is a boy. He is tall and happy. This is Lily. She is my friend too. She is a girl. She is short and funny. Mr Nam is our teacher. He is very kind.'],
     sentenceBank:['He is a boy.','She is a girl.','He is tall.','She is happy.','He is my friend.','She is my teacher.','He is sad.','She is short.','Ben is a happy boy.','Lily is a funny girl.','My teacher is kind.','She is my friend.'],
     tfngBank:[{s:'Ben is a boy.',a:'T'},{s:'Ben is short.',a:'F'},{s:'Lily is funny.',a:'T'},{s:'Lily has a cat.',a:'NG'},{s:'Mr Nam is a teacher.',a:'T'},{s:'Mr Nam is sad.',a:'NG'}],
     qaBank:[{q:'Who is tall and happy?',a:['Ben']},{q:'Is Lily a boy or a girl?',a:['a girl','girl','She is a girl']},{q:'Who is the teacher?',a:['Mr Nam']}],
     imageKeywords:['friends','boy','girl'], names:{Ben:'m',Lily:'f'}, allowedExtra:['ben','lily','nam','mr']})
   ]},
   {id:'ex1-l1-u2', code:'U2', name:'At school', lessons:[
    L({id:'ex1-l1-u2-1', code:'2.1', name:'Classroom objects',
     objectives:['Name classroom objects','Use this/that and It is …','Describe colours of objects'],
     vocab:[V('book','n','quyển sách','📕','you read it'),V('pen','n','bút mực','🖊️','you write with it'),V('pencil','n','bút chì','✏️','you draw with it'),V('ruler','n','thước kẻ','📏','you draw lines with it'),
       V('bag','n','cặp sách','🎒','you carry books in it'),V('desk','n','bàn học','🗄️','you sit and write at it'),V('chair','n','ghế','🪑','you sit on it'),V('eraser','n','tẩy','🧽','it cleans pencil lines'),
       V('board','n','bảng','🟩','the teacher writes on it'),V('crayon','n','bút sáp','🖍️','a colour stick'),V('notebook','n','vở','📓','you write in it'),V('scissors','n','kéo','✂️','you cut paper with it')],
     grammar:['This is a … / That is a …','It is a (colour) …'], topic:'school', topicKeys:['school','classroom','desk','book','pen','bag'],
     banned:['although','was','were','have been'],
     passages:['This is my classroom. This is my desk. My bag is on the chair. In my bag, I have a book, a pen and a pencil. I have a ruler and an eraser too. My crayons are red, blue and green. The board is big.'],
     sentenceBank:['This is a pen.','It is a red pencil.','This is my book.','That is a ruler.','It is my bag.','This is a chair.','That is a desk.','It is a blue crayon.','This is my notebook.','That is the board.','This is an eraser.','These are my scissors.'],
     tfngBank:[{s:'The bag is on the chair.',a:'T'},{s:'There is a book in the bag.',a:'T'},{s:'The crayons are black.',a:'F'},{s:'The board is small.',a:'F'},{s:'The teacher has a pen.',a:'NG'},{s:'The desk is new.',a:'NG'}],
     qaBank:[{q:'Where is the bag?',a:['on the chair','It is on the chair']},{q:'What colour are the crayons?',a:['red, blue and green','red blue and green']},{q:'Is the board big or small?',a:['big','It is big']}],
     imageKeywords:['classroom','pencil','book'], names:{}, allowedExtra:['classroom','crayons']}),
    L({id:'ex1-l1-u2-2', code:'2.2', name:'There is / There are',
     objectives:['Say what is in a room','Use there is / there are','Count objects to ten'],
     vocab:[V('window','n','cửa sổ','🪟','you look out of it'),V('door','n','cửa ra vào','🚪','you open it to go in'),V('picture','n','bức tranh','🖼️','a drawing or photo'),V('clock','n','đồng hồ','⏰','it shows the time'),
       V('computer','n','máy tính','💻','a machine for work and games'),V('table','n','cái bàn','🛋️','a piece of furniture'),V('student','n','học sinh','🧒','a person who learns'),V('wall','n','bức tường','🧱','a side of a room'),
       V('room','n','căn phòng','🏠','a space in a building'),V('plant','n','cái cây','🪴','a green living thing'),V('box','n','cái hộp','📦','you put things in it')],
     grammar:['There is a …','There are (number) …'], topic:'school', topicKeys:['room','classroom','window','door','student'],
     banned:['although','was','were'],
     passages:['There is a big room in my school. There are two windows and one door. There is a clock on the wall. There are three pictures on the wall too. There is a computer on the table. There are ten students in the room.'],
     sentenceBank:['There is a clock.','There are two windows.','There is a computer.','There are three pictures.','There is a door.','There are two tables.','There is a plant.','There are ten students.','There is a box on the table.','There are four chairs.'],
     tfngBank:[{s:'There are two windows.',a:'T'},{s:'There are two doors.',a:'F'},{s:'The clock is on the wall.',a:'T'},{s:'There is a cat in the room.',a:'NG'},{s:'There are ten students.',a:'T'}],
     qaBank:[{q:'How many windows are there?',a:['two','There are two windows','2']},{q:'Where is the clock?',a:['on the wall']},{q:'How many students are there?',a:['ten','10']}],
     imageKeywords:['room','window','clock'], names:{}, allowedExtra:['school','chairs','tables','windows','pictures','students']})
   ]},
   {id:'ex1-l1-u3', code:'U3', name:'Food and drink', lessons:[
    L({id:'ex1-l1-u3-1', code:'3.1', name:'Likes and dislikes',
     objectives:['Name common food and drink','Say what you like and don\'t like','Ask Do you like …?'],
     vocab:[V('apple','n','quả táo','🍎','a red or green fruit'),V('banana','n','quả chuối','🍌','a long yellow fruit'),V('milk','n','sữa','🥛','a white drink'),V('rice','n','cơm','🍚','small white grains'),
       V('fish','n','cá','🐟','it lives in water'),V('chicken','n','thịt gà','🍗','meat from a bird'),V('bread','n','bánh mì','🍞','you make toast with it'),V('cake','n','bánh ngọt','🎂','a sweet food for parties'),
       V('juice','n','nước ép','🧃','a fruit drink'),V('egg','n','quả trứng','🥚','a hen lays it'),V('like','v','thích','👍','enjoy'),V('carrot','n','cà rốt','🥕','an orange vegetable')],
     grammar:['I like … / I don\'t like …','Do you like …? Yes, I do. / No, I don\'t.'], topic:'food', topicKeys:['food','like','apple','milk','fish','cake','eat'],
     banned:['although','was','were','would','had'],
     passages:['My name is Tom. I like apples and bananas. I like milk too. I don\'t like fish. My sister Mai likes fish and rice. She doesn\'t like cake. We like juice and bread for breakfast.'],
     dialogue:'A: Do you like apples?\nB: Yes, I do. I like apples.\nA: Do you like fish?\nB: No, I don\'t. I like chicken.',
     sentenceBank:['I like apples.','I don\'t like fish.','I like milk.','I don\'t like eggs.','I like cake.','Tom likes bananas.','I like rice and chicken.','I don\'t like bread.','Mai likes juice.','Do you like carrots?','We like apples.','She likes milk.'],
     tfngBank:[{s:'Tom likes apples.',a:'T'},{s:'Tom likes fish.',a:'F'},{s:'Mai likes fish and rice.',a:'T'},{s:'Mai likes cake.',a:'F'},{s:'Tom likes carrots.',a:'NG'},{s:'They like juice.',a:'T'}],
     qaBank:[{q:'What fruit does Tom like?',a:['apples and bananas','apples','bananas']},{q:'What does Tom not like?',a:['fish']},{q:'What does Mai like?',a:['fish and rice','fish','rice']},{q:'What do they have for breakfast?',a:['juice and bread','juice','bread']}],
     imageKeywords:['food','apple','cake'], names:{Tom:'m',Mai:'f'}, allowedExtra:['tom','mai','breakfast','apples','bananas','eggs','carrots','likes']}),
    L({id:'ex1-l1-u3-2', code:'3.2', name:'Can I have …?',
     objectives:['Ask for food politely','Respond with Here you are','Say thank you'],
     vocab:[V('water','n','nước','💧','a clear drink'),V('sandwich','n','bánh kẹp','🥪','bread with food inside'),V('soup','n','súp','🍲','hot food you eat with a spoon'),V('pizza','n','bánh pizza','🍕','a round Italian food'),
       V('orange','n','quả cam','🍊','an orange fruit'),V('tea','n','trà','🍵','a hot drink'),V('ice cream','n','kem','🍦','a cold sweet food'),V('please','adv','làm ơn','🙏','a polite word'),
       V('here you are','phr','của bạn đây','🤲','words when you give something'),V('hungry','adj','đói','😋','you want food'),V('thirsty','adj','khát','🥵','you want a drink')],
     grammar:['Can I have …, please?','Here you are. / Thank you.'], topic:'food', topicKeys:['food','have','water','pizza','hungry','please'],
     banned:['although','would','could','was'],
     passages:['Ben is hungry. He goes to the kitchen. "Can I have a sandwich, please?" he asks. "Here you are," says Mum. "Can I have some water too? I\'m thirsty." "Yes, here you are." "Thank you, Mum!"'],
     sentenceBank:['Can I have some water, please?','Here you are.','Can I have a sandwich?','Can I have an orange, please?','Thank you.','Can I have some soup?','Can I have a pizza, please?','I\'m hungry.','I\'m thirsty.','Can I have some tea?'],
     tfngBank:[{s:'Ben is hungry.',a:'T'},{s:'Ben asks for pizza.',a:'F'},{s:'Ben is thirsty.',a:'T'},{s:'Ben likes soup.',a:'NG'}],
     qaBank:[{q:'What does Ben ask for first?',a:['a sandwich','sandwich']},{q:'What does he ask for next?',a:['some water','water']},{q:'Who gives Ben the food?',a:['Mum','his mum']}],
     imageKeywords:['kitchen','sandwich','water'], names:{Ben:'m'}, allowedExtra:['ben','mum','kitchen','goes','asks','says','some']})
   ]}
  ]},
  {id:'ex1-l2', name:'Level 2', cefr:'A1', soft:11, hard:16, units:[
   {id:'ex1-l2-u1', code:'U1', name:'My day', lessons:[
    L({id:'ex1-l2-u1-1', code:'1.1', name:'Daily routines',
     objectives:['Talk about daily routines','Ask and answer about times','Use adverbs of frequency','Use present simple with he/she'],
     vocab:[V('wake up','v','thức dậy','⏰','stop sleeping'),V('get up','v','ra khỏi giường','🛏️','leave your bed'),V('brush','v','chải, đánh (răng)','🪥','clean with a brush'),V('teeth','n','răng','🦷','you bite with them'),
       V('breakfast','n','bữa sáng','🥣','food in the morning'),V('school','n','trường học','🏫','a place to learn'),V('lunch','n','bữa trưa','🍱','food in the middle of the day'),V('homework','n','bài tập về nhà','📚','school work at home'),
       V('watch TV','v','xem TV','📺','look at programmes'),V('go to bed','v','đi ngủ','🌙','start sleeping'),V('usually','adv','thường','🔁','most of the time'),V('always','adv','luôn luôn','✅','every time'),
       V('never','adv','không bao giờ','🚫','not at any time'),V('sometimes','adv','thỉnh thoảng','🎲','some of the time'),V('morning','n','buổi sáng','🌅','early in the day'),V('evening','n','buổi tối','🌆','late in the day')],
     grammar:['Present simple (I/you/we/they; he/she + -s)','Adverbs of frequency: always, usually, sometimes, never'], topic:'daily life', topicKeys:['day','morning','school','breakfast','routine','bed','evening'],
     banned:['went','woke','had','was','were','is watching','are going','will'],
     passages:['Anna wakes up at six o\'clock. She usually brushes her teeth and has breakfast at half past six. She goes to school at seven. She has lunch at school. In the afternoon, she always does her homework. In the evening, she sometimes watches TV. She never goes to bed late. She goes to bed at nine o\'clock.'],
     dialogue:'A: What time do you wake up?\nB: I wake up at six o\'clock.\nA: Do you have breakfast at home?\nB: Yes, I always have breakfast with my family.',
     sentenceBank:['I wake up at six o\'clock.','She brushes her teeth every morning.','We have breakfast at seven.','He goes to school by bus.','They have lunch at school.','I always do my homework.','She sometimes watches TV.','He never goes to bed late.','We usually get up early.','Anna goes to bed at nine.','Ben has breakfast with his family.','I usually watch TV in the evening.'],
     tfngBank:[{s:'Anna wakes up at six o\'clock.',a:'T'},{s:'She has breakfast at seven.',a:'F'},{s:'She has lunch at home.',a:'F'},{s:'She always does her homework in the afternoon.',a:'T'},{s:'She has a brother.',a:'NG'},{s:'She goes to school by bus.',a:'NG'},{s:'She never watches TV.',a:'F'}],
     qaBank:[{q:'What time does Anna wake up?',a:['at six','at six o\'clock','six o\'clock','six']},{q:'Where does she have lunch?',a:['at school']},{q:'What does she always do in the afternoon?',a:['her homework','homework','she does her homework']},{q:'What time does she go to bed?',a:['at nine','nine o\'clock','at nine o\'clock']},{q:'When does she go to school?',a:['at seven','seven o\'clock','at seven o\'clock']}],
     wordFamilies:[{base:'GO',text:'She ___ to school at seven.',ans:['goes']},{base:'BRUSH',text:'He ___ his teeth every morning.',ans:['brushes']},{base:'HAVE',text:'Anna ___ lunch at school.',ans:['has']},
       {base:'WATCH',text:'Ben ___ TV in the evening.',ans:['watches']},{base:'DO',text:'She ___ her homework after school.',ans:['does']},{base:'USUAL',text:'I ___ get up at six.',ans:['usually']},{base:'WAKE',text:'My mother ___ up early.',ans:['wakes']}],
     rewritePairs:[{original:'I go to bed at nine o\'clock.',lead:'She',accepted:['She goes to bed at nine o\'clock.']},{original:'We have breakfast at seven.',lead:'He',accepted:['He has breakfast at seven.']},
       {original:'They watch TV in the evening.',lead:'Anna',accepted:['Anna watches TV in the evening.']},{original:'I brush my teeth every morning.',lead:'Ben',accepted:['Ben brushes his teeth every morning.']},
       {original:'You do your homework after school.',lead:'She',accepted:['She does her homework after school.']}],
     imageKeywords:['morning','school','clock','bed'], names:{Anna:'f',Ben:'m'},
     allowedExtra:['anna','ben','wakes','brushes','goes','watches','does','gets','afternoon','late','early','bus','home','family','routine']})
   ]}
  ]}
 ]};

const pw = {id:'pw', name:'Pathway B1 Reading & Grammar', subject:'Tiếng Anh', age:'13–15', cefr:'B1', version:'1.0', status:'active',
 levels:[
  {id:'pw-l1', name:'Level 1', cefr:'B1', soft:18, hard:26, units:[
   {id:'pw-l1-u1', code:'U1', name:'Technology and me', lessons:[
    L({id:'pw-l1-u1-1', code:'1.1', name:'Present perfect for experience',
     objectives:['Talk about life experiences with technology','Use ever/never with present perfect','Ask Have you ever …?'],
     vocab:[V('ever','adv','từng','❓'),V('never','adv','chưa bao giờ','🚫'),V('download','v','tải về','⬇️'),V('app','n','ứng dụng','📱'),V('robot','n','rô-bốt','🤖'),
       V('website','n','trang web','🌐'),V('gadget','n','đồ công nghệ','🔌'),V('online','adv','trực tuyến','🛜'),V('experience','n','trải nghiệm','✨'),V('invention','n','phát minh','💡'),
       V('virtual reality','n','thực tế ảo','🥽'),V('smartphone','n','điện thoại thông minh','📲'),V('abroad','adv','ở nước ngoài','✈️'),V('try','v','thử','🧪')],
     grammar:['Have you ever + past participle?','I have / haven\'t + past participle; never; twice'], topic:'technology', topicKeys:['technology','app','robot','online','website','gadget','smartphone'],
     banned:['would have','had been','will have','had used'],
     passages:['Linh has used a smartphone for five years, but she has never built an app. She has tried virtual reality glasses twice, and she thinks they are amazing. Her friend Jack has never shopped online without his parents. He has downloaded many educational apps, but he hasn\'t bought a gadget with his own money yet. Both of them have visited a robot café in the city.'],
     sentenceBank:['Have you ever used a robot?','I have never downloaded a game.','She has visited many websites.','Have you ever bought a gadget online?','We have tried virtual reality.','He has never travelled abroad.','They have watched videos about inventions.','I have used this app twice.','Has she ever built a website?','My brother has never had a smartphone.','Have they ever met a robot?','I haven\'t tried that app yet.'],
     tfngBank:[{s:'Linh has built several apps.',a:'F'},{s:'Linh has tried virtual reality glasses twice.',a:'T'},{s:'Jack has shopped online alone.',a:'F'},{s:'Jack has downloaded educational apps.',a:'T'},{s:'Linh has a brother.',a:'NG'},{s:'They have visited a robot café.',a:'T'},{s:'Jack wants to become an engineer.',a:'NG'}],
     qaBank:[{q:'How long has Linh used a smartphone?',a:['for five years','five years']},{q:'What has Linh never done?',a:['built an app','she has never built an app']},{q:'What kind of apps has Jack downloaded?',a:['educational apps','educational']},{q:'Where have both of them been?',a:['a robot café','to a robot café','a robot café in the city']}],
     wordFamilies:[{base:'INVENT',text:'The smartphone is an amazing ___.',ans:['invention']},{base:'EDUCATE',text:'He has downloaded many ___ apps.',ans:['educational']},{base:'AMAZE',text:'She thinks the glasses are ___.',ans:['amazing']},
       {base:'EXPERIENCE',text:'Linh is an ___ user of smartphones.',ans:['experienced']},{base:'TECHNOLOGY',text:'We visited a ___ fair last year.',ans:['technology','technological']}],
     rewritePairs:[{original:'I started using a smartphone five years ago.',lead:'I have',accepted:['I have used a smartphone for five years.']},{original:'This is my first time in a robot café.',lead:'I have never',accepted:['I have never been to a robot café before.','I have never been in a robot café before.']},
       {original:'She started using the app in May.',lead:'She has',accepted:['She has used the app since May.']},{original:'Jack didn\'t buy a gadget with his money.',lead:'Jack has never',accepted:['Jack has never bought a gadget with his money.','Jack has never bought a gadget with his own money.']}],
     imageKeywords:['robot','smartphone','technology'], names:{Linh:'f',Jack:'m'},
     allowedExtra:['linh','jack','used','built','tried','shopped','downloaded','bought','visited','travelled','watched','met','had','been','yet','twice','glasses','amazing','educational','parents','money','own','café','city','both','games','game','videos','inventions','engineer','years','several','alone','without','thinks','first','started','using','ago','since','before']}),
    L({id:'pw-l1-u1-2', code:'1.2', name:'Word formation: nouns',
     objectives:['Form nouns with -tion, -ment, -ity, -ery','Use abstract nouns about technology','Recognise word families'],
     vocab:[V('invention','n','phát minh','💡'),V('information','n','thông tin','ℹ️'),V('development','n','sự phát triển','📈'),V('discovery','n','khám phá','🔭'),
       V('connection','n','kết nối','🔗'),V('creativity','n','sự sáng tạo','🎨'),V('communication','n','giao tiếp','💬'),V('improvement','n','sự cải thiện','⬆️'),
       V('decision','n','quyết định','⚖️'),V('education','n','giáo dục','🎓'),V('solution','n','giải pháp','🧩'),V('security','n','an ninh','🔒')],
     grammar:['Suffixes -tion / -ment / -ity / -ery','Noun phrases: the + noun + of'], topic:'technology', topicKeys:['technology','internet','online','robots','app','computer'],
     banned:['would have','had been'],
     passages:['The invention of the internet has changed communication around the world. Today we can find information in seconds, and online education is part of school life. However, the fast development of technology also brings problems. Online security is now a big issue, and every user has to make a decision about what to share. Creativity and good communication help young people find a solution.'],
     sentenceBank:['The invention of the internet changed communication.','We need more information about the app.','This discovery has helped many people.','Good communication is important online.','The company made a quick decision.','Education is changing with technology.','There is a simple solution to this problem.','Online security is a big issue.','The development of robots is fast.','Creativity helps us solve problems.','The connection is very slow today.','We have seen a big improvement this year.'],
     tfngBank:[{s:'The internet has changed communication.',a:'T'},{s:'Finding information takes a long time today.',a:'F'},{s:'Online security is not a problem.',a:'F'},{s:'Creativity can help young people.',a:'T'},{s:'Most students prefer printed books.',a:'NG'}],
     qaBank:[{q:'What has the internet changed?',a:['communication','communication around the world']},{q:'What is a big issue online now?',a:['security','online security']},{q:'What helps young people find a solution?',a:['creativity and good communication','creativity and communication']}],
     wordFamilies:[{base:'INVENT',text:'The ___ of the telephone was important.',ans:['invention']},{base:'INFORM',text:'We need more ___ about the course.',ans:['information']},{base:'DEVELOP',text:'The ___ of the city was fast.',ans:['development']},
       {base:'DISCOVER',text:'It was an exciting ___.',ans:['discovery']},{base:'CONNECT',text:'The internet ___ is slow.',ans:['connection']},{base:'CREATE',text:'Art classes improve ___.',ans:['creativity']},
       {base:'COMMUNICATE',text:'Good ___ is important in a team.',ans:['communication']},{base:'IMPROVE',text:'There is a big ___ in her English.',ans:['improvement']},{base:'DECIDE',text:'It was a difficult ___.',ans:['decision']},
       {base:'EDUCATE',text:'___ is the key to the future.',ans:['education','Education']},{base:'SOLVE',text:'We need a ___ to this problem.',ans:['solution']},{base:'SECURE',text:'Online ___ matters.',ans:['security']}],
     rewritePairs:[{original:'They developed the app quickly.',lead:'The development of the app',accepted:['The development of the app was quick.']},{original:'We decided to stop the project.',lead:'We made a decision',accepted:['We made a decision to stop the project.']},
       {original:'Her English improved a lot.',lead:'There was a big',accepted:['There was a big improvement in her English.']},{original:'Scientists discovered a new planet.',lead:'The discovery',accepted:['The discovery of a new planet was made by scientists.']}],
     imageKeywords:['internet','information','technology'], names:{},
     allowedExtra:['internet','changed','world','seconds','school','life','however','fast','brings','problems','problem','issue','user','share','young','people','helped','important','company','quick','changing','simple','solve','slow','seen','year','telephone','exciting','difficult','key','future','team','course','city','art','classes','project','planet','scientists','made','quickly','developed','decided','stop','improved','discovered','printed','books','prefer','students','takes','long']})
   ]},
   {id:'pw-l1-u2', code:'U2', name:'Travel', lessons:[
    L({id:'pw-l1-u2-1', code:'2.1', name:'Past simple vs continuous',
     objectives:['Tell a short travel story','Contrast past simple and past continuous','Use when / while'],
     vocab:[V('journey','n','hành trình','🧭'),V('flight','n','chuyến bay','✈️'),V('passport','n','hộ chiếu','🛂'),V('luggage','n','hành lý','🧳'),V('delayed','adj','bị hoãn','⏳'),
       V('platform','n','sân ga','🚉'),V('tourist','n','khách du lịch','📸'),V('guide','n','hướng dẫn viên','🗺️'),V('suddenly','adv','đột nhiên','⚡'),V('while','conj','trong khi','⏱️'),
       V('station','n','nhà ga','🚆'),V('ticket','n','vé','🎫'),V('arrive','v','đến nơi','🛬'),V('airport','n','sân bay','🛫')],
     grammar:['Past simple vs past continuous','when + past simple; while + past continuous'], topic:'travel', topicKeys:['travel','journey','station','flight','tourist','trip','airport'],
     banned:['would have','had been','will'],
     passages:['Last summer Sara was travelling to Rome with her family. While they were waiting at the station, a man suddenly took her bag. A tourist guide saw him and shouted. When the police arrived, the man was running towards the platform. Sara got her bag back, and her passport was still inside. The rest of the journey was quiet, but their flight home was delayed by two hours.'],
     dialogue:'A: What were you doing when the train arrived?\nB: I was buying a ticket.\nA: Did you find a seat?\nB: Yes, but my luggage was very heavy.',
     sentenceBank:['I was reading when the train arrived.','While we were waiting, it started to rain.','She lost her passport at the airport.','They were walking to the station when they met a guide.','The flight was delayed by two hours.','He was carrying heavy luggage.','We bought our tickets online.','Suddenly, the lights went out.','When I arrived, everyone was sleeping.','The tourists were taking photos on the platform.','My journey was long but interesting.','Leo was looking for his ticket.'],
     tfngBank:[{s:'Sara was travelling to Rome.',a:'T'},{s:'A tourist guide took her bag.',a:'F'},{s:'The man was running towards the platform.',a:'T'},{s:'Her passport was missing.',a:'F'},{s:'Sara visited the Colosseum.',a:'NG'},{s:'The flight home was on time.',a:'F'},{s:'Sara was travelling with her family.',a:'T'}],
     qaBank:[{q:'Where was Sara travelling to?',a:['Rome','to Rome']},{q:'What were they doing when the man took the bag?',a:['waiting at the station','they were waiting at the station']},{q:'Who shouted?',a:['a tourist guide','the tourist guide','a guide']},{q:'How long was the flight delayed?',a:['two hours','by two hours','2 hours']}],
     wordFamilies:[{base:'TRAVEL',text:'The ___ took photos of the river.',ans:['travellers','traveller','travelers']},{base:'TOUR',text:'Many ___ visit Rome every year.',ans:['tourists']},{base:'ARRIVE',text:'Our ___ was two hours late.',ans:['arrival']},
       {base:'DEPART',text:'The ___ time is 6 p.m.',ans:['departure']},{base:'SUDDEN',text:'___, the lights went out.',ans:['Suddenly','suddenly']},{base:'COMFORT',text:'The seats were very ___.',ans:['comfortable']}],
     rewritePairs:[{original:'I was having dinner. The phone rang.',lead:'While I',accepted:['While I was having dinner, the phone rang.']},{original:'We were walking home. It started to rain.',lead:'It started to rain while',accepted:['It started to rain while we were walking home.']},
       {original:'She arrived. They were eating.',lead:'When she arrived,',accepted:['When she arrived, they were eating.']},{original:'The plane landed. We were sleeping.',lead:'We were sleeping when',accepted:['We were sleeping when the plane landed.']}],
     imageKeywords:['station','airport','luggage'], names:{Sara:'f',Leo:'m'},
     allowedExtra:['sara','leo','rome','summer','last','travelling','waiting','man','took','bag','saw','shouted','police','running','towards','got','back','still','inside','rest','quiet','home','hours','reading','train','arrived','started','rain','lost','walking','met','carrying','heavy','bought','tickets','lights','went','everyone','sleeping','tourists','taking','photos','long','interesting','looking','was','were','had','dinner','phone','rang','eating','plane','landed','river','visit','year','late','seats','p.m.','doing','buying','find','seat','did','missing','visited','colosseum']})
   ]}
  ]}
 ]};

WS.CURRICULA = [ex1, pw];

/* curriculum markdown sample for admin import */
WS.SAMPLE_CURRICULUM_MD = `# Discovery Kids
version: 2026.1

## Level 1 (Pre-A1)
### U1 Animals
#### 1.1 Farm animals
- objectives: Name farm animals; Say what an animal can do
- vocabulary: cow | n | con bò | 🐄; pig | n | con lợn | 🐖; duck | n | con vịt | 🦆; hen | n | gà mái | 🐔; horse | n | con ngựa | 🐎; sheep | n | con cừu | 🐑
- grammar: It is a …; It can …
- skills: reading, speaking
- topic: animals
- forbidden: was, were, would
- passage: |
    This is a farm. There is a cow and a pig. The duck can swim. The horse can run.
- sentences: It is a cow.; The duck can swim.; The horse can run.; It is a pig.; The hen is small.
`;

WS.SAMPLE_THEME_MD = `# Robot Workshop
- age: 8–11
- levels: A1–A2
- setting: Một xưởng chế tạo robot của câu lạc bộ khoa học trường
- plot: Cả nhóm cùng lắp một robot giúp việc nhà
- characters: Nia (kỹ sư nhí, f), Kai (lập trình viên, m)
- places: xưởng, phòng thử nghiệm
- avoid: bạo lực, vũ khí`;

WS.SAMPLE_KNOWLEDGE_MD = (l)=>`# Kiến thức · Lesson ${l.code} ${l.name}
## Trọng tâm
- vocabulary: ${l.vocab.map(v=>v.w).join(', ')}
- grammar: ${l.grammar.join('; ')}
- min_repeat: 2
## Ôn tập
- review: (liệt kê lesson cần ôn)
## Vùng được phép
- allowed_extra: ${(l.allowedExtra||[]).slice(0,8).join(', ')}
## Vùng cấm
- forbidden: ${l.banned.join(', ')}
## Giới hạn
- max_words_per_sentence: 12
`;
WS.SAMPLE_SKILL_MD = (l)=>`# Skill · Lesson ${l.code} ${l.name}
## Quy tắc cứng
- R-1: Mỗi câu chỉ dùng từ trong Trọng tâm, Ôn tập và Vùng được phép.
- R-2: Không dùng mục trong Vùng cấm.
- R-3: Mỗi mục Trọng tâm xuất hiện ít nhất min_repeat lần trong phiếu.
## Quy tắc mềm
- Câu ngắn, gần gũi với học sinh.
## Cách dùng theme
- Theme chỉ là bối cảnh; nhân vật theme thay tên người trong câu.
`;
