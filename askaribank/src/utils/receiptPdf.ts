import { jsPDF } from 'jspdf';

export function downloadTransferReceipt(details: {
  transactionId: string;
  amount: string;
  recipientName: string;
  account: string;
  platform: string;
  description: string;
}) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('AskariBank', 20, 24);
  doc.setFontSize(12);
  doc.text('Digital Transfer Receipt', 20, 32);
  doc.line(20, 36, 190, 36);

  const rows = [
    ['Transaction ID', details.transactionId],
    ['Platform', details.platform],
    ['Recipient', details.recipientName],
    ['Account', details.account],
    ['Amount', `Rs ${parseFloat(details.amount).toLocaleString()}`],
    ['Description', details.description || '—'],
    ['Date', new Date().toLocaleString()],
    ['Status', 'Completed'],
  ];

  let y = 48;
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 70, y);
    y += 12;
  });

  doc.save(`AskariBank-Receipt-${details.transactionId}.pdf`);
}
