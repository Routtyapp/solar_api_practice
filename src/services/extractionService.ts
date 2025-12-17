export interface ExtractionSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description: string;
  }>;
}

export interface ExtractionResult {
  id: string;
  choices: Array<{
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function extractInformation(
  file: File,
  schema: ExtractionSchema
): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('schema', JSON.stringify(schema));

  const response = await fetch('/api/information-extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract information');
  }

  return response.json();
}

export function parseExtractionResult(result: ExtractionResult): Record<string, unknown> | null {
  try {
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  } catch {
    return null;
  }
}

export function generateSchemaFromQuery(query: string): ExtractionSchema {
  const schema: ExtractionSchema = {
    type: 'object',
    properties: {},
  };

  const lowerQuery = query.toLowerCase();

  // 한국어 및 영어 패턴 매칭
  const patterns: Record<string, { keywords: string[]; type: string; description: string }> = {
    bank_name: { keywords: ['은행', 'bank'], type: 'string', description: 'The name of bank' },
    account_number: { keywords: ['계좌', 'account'], type: 'string', description: 'Account number' },
    balance: { keywords: ['잔액', 'balance', '잔고'], type: 'string', description: 'Account balance' },
    name: { keywords: ['이름', '성명', 'name', '명의'], type: 'string', description: 'Name of person or entity' },
    date: { keywords: ['날짜', '일자', 'date', '일시'], type: 'string', description: 'Date information' },
    amount: { keywords: ['금액', '가격', '비용', 'amount', 'price'], type: 'string', description: 'Amount or price' },
    total: { keywords: ['총', '합계', 'total', '총액', '총합'], type: 'string', description: 'Total amount' },
    address: { keywords: ['주소', 'address', '소재지'], type: 'string', description: 'Address' },
    phone: { keywords: ['전화', '연락처', 'phone', '휴대폰'], type: 'string', description: 'Phone number' },
    email: { keywords: ['이메일', 'email', '메일'], type: 'string', description: 'Email address' },
    company: { keywords: ['회사', '업체', '상호', 'company', '기업'], type: 'string', description: 'Company name' },
    transaction: { keywords: ['거래', 'transaction', '내역'], type: 'string', description: 'Transaction details' },
    item: { keywords: ['품목', '항목', '상품', 'item', '제품'], type: 'string', description: 'Item or product' },
    quantity: { keywords: ['수량', 'quantity', '개수'], type: 'string', description: 'Quantity' },
    id_number: { keywords: ['번호', 'id', '식별', '주민'], type: 'string', description: 'ID or reference number' },
  };

  for (const [field, config] of Object.entries(patterns)) {
    if (config.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      schema.properties[field] = {
        type: config.type,
        description: config.description,
      };
    }
  }

  // 매칭되는 패턴이 없으면 문서 전체 분석
  if (Object.keys(schema.properties).length === 0) {
    schema.properties = {
      title: { type: 'string', description: 'Document title or main heading' },
      main_content: { type: 'string', description: 'Main content or key information' },
      summary: { type: 'string', description: 'Brief summary of the document' },
    };
  }

  return schema;
}

export function formatExtractedData(data: Record<string, unknown>): string {
  const lines: string[] = ['📋 **추출된 정보:**', ''];

  const labelMap: Record<string, string> = {
    bank_name: '🏦 은행명',
    account_number: '💳 계좌번호',
    balance: '💰 잔액',
    name: '👤 이름',
    date: '📅 날짜',
    amount: '💵 금액',
    total: '📊 총액',
    address: '📍 주소',
    phone: '📞 전화번호',
    email: '✉️ 이메일',
    company: '🏢 회사명',
    transaction: '📝 거래내역',
    item: '📦 품목',
    quantity: '🔢 수량',
    id_number: '🔖 번호',
    title: '📑 제목',
    main_content: '📄 주요 내용',
    summary: '📝 요약',
  };

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      const label = labelMap[key] || key;
      lines.push(`${label}: ${value}`);
    }
  }

  return lines.join('\n');
}
