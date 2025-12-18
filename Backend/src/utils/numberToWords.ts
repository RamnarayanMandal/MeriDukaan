/**
 * Converts a number to words (Indian numbering system)
 * Example: 1234.56 -> "One Thousand Two Hundred Thirty Four Rupees and Fifty Six Paise Only"
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

const scales = ['', 'Thousand', 'Lakh', 'Crore'];

function convertHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

function convertThousands(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  let scaleIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkWords = convertHundreds(chunk);
      if (scaleIndex > 0 && chunkWords) {
        result = chunkWords + ' ' + scales[scaleIndex] + ' ' + result;
      } else {
        result = chunkWords + ' ' + result;
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  return result.trim();
}

export function numberToWords(amount: number): string {
  if (amount === 0) {
    return 'Zero Rupees Only';
  }
  
  // Split into rupees and paise
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  // Convert rupees
  if (rupees > 0) {
    if (rupees >= 10000000) {
      // Crores
      const crores = Math.floor(rupees / 10000000);
      result += convertThousands(crores) + ' Crore ';
      const remaining = rupees % 10000000;
      if (remaining > 0) {
        result += convertThousands(remaining) + ' ';
      }
    } else if (rupees >= 100000) {
      // Lakhs
      const lakhs = Math.floor(rupees / 100000);
      result += convertThousands(lakhs) + ' Lakh ';
      const remaining = rupees % 100000;
      if (remaining > 0) {
        result += convertThousands(remaining) + ' ';
      }
    } else {
      result += convertThousands(rupees) + ' ';
    }
    
    result += rupees === 1 ? 'Rupee' : 'Rupees';
  }
  
  // Convert paise
  if (paise > 0) {
    if (result) {
      result += ' and ';
    }
    result += convertHundreds(paise) + ' ';
    result += paise === 1 ? 'Paise' : 'Paise';
  }
  
  return result.trim() + ' Only';
}

