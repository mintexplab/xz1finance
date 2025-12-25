import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StripeCharge } from '@/hooks/useStripeData';
import { ManualTransaction } from '@/hooks/useManualTransactions';
import { format } from 'date-fns';

interface ExportOptions {
  title: string;
  dateRange: { start: Date; end: Date };
  currency: 'CAD' | 'USD';
  stripeCharges: StripeCharge[];
  manualTransactions: ManualTransaction[];
  conversionRate?: number; // USD to CAD rate
}

const formatAmount = (amountInCents: number, currency: string, targetCurrency: string, conversionRate: number = 1.36) => {
  let amount = amountInCents / 100;
  
  // Convert if needed
  if (currency.toUpperCase() !== targetCurrency) {
    if (targetCurrency === 'CAD' && currency.toUpperCase() === 'USD') {
      amount *= conversionRate;
    } else if (targetCurrency === 'USD' && currency.toUpperCase() === 'CAD') {
      amount /= conversionRate;
    }
  }

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export function generatePDFStatement(options: ExportOptions) {
  const { title, dateRange, currency, stripeCharges, manualTransactions, conversionRate = 1.36 } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 0, 149); // Pink accent
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('XZ1 Recording Ventures', 20, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Statement', pageWidth - 20, 20, { align: 'right' });
  doc.text(`${currency} Report`, pageWidth - 20, 28, { align: 'right' });

  // Report details
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Period: ${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`, 20, 50);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, 56);

  let yPos = 70;

  // Summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 10;

  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalFees = 0;

  stripeCharges
    .filter(c => c.status === 'succeeded')
    .forEach(charge => {
      let amount = charge.amount;
      if (charge.currency.toUpperCase() !== currency) {
        amount = currency === 'CAD' ? amount * conversionRate : amount / conversionRate;
      }
      totalIncome += amount;
      
      if (typeof charge.balance_transaction === 'object' && charge.balance_transaction) {
        let fee = charge.balance_transaction.fee;
        if (charge.currency.toUpperCase() !== currency) {
          fee = currency === 'CAD' ? fee * conversionRate : fee / conversionRate;
        }
        totalFees += fee;
      }
    });

  manualTransactions.forEach(tx => {
    let amount = Number(tx.amount);
    if (tx.currency !== currency) {
      amount = currency === 'CAD' ? amount * conversionRate : amount / conversionRate;
    }
    
    if (tx.type === 'income' || tx.type === 'royalty') {
      totalIncome += amount;
    } else if (tx.type === 'expense') {
      totalExpenses += amount;
    }
  });

  const netRevenue = totalIncome - totalExpenses - totalFees;

  // Summary table
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Amount']],
    body: [
      ['Gross Income', formatAmount(totalIncome, currency, currency)],
      ['Operating Expenses', formatAmount(totalExpenses, currency, currency)],
      ['Processing Fees', formatAmount(totalFees, currency, currency)],
      ['Net Revenue', formatAmount(netRevenue, currency, currency)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [255, 0, 149], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 20, right: 20 },
    styles: { font: 'helvetica' },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  // Stripe Transactions
  if (stripeCharges.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Stripe Transactions', 20, yPos);
    yPos += 5;

    const stripeData = stripeCharges
      .filter(c => c.status === 'succeeded')
      .map(charge => {
        const bt = typeof charge.balance_transaction === 'object' ? charge.balance_transaction : null;
        return [
          format(new Date(charge.created * 1000), 'MMM d, yyyy'),
          charge.description || 'Payment',
          formatAmount(charge.amount, charge.currency, currency, conversionRate),
          bt ? formatAmount(bt.fee, charge.currency, currency, conversionRate) : '-',
          bt ? formatAmount(bt.net, charge.currency, currency, conversionRate) : '-',
        ];
      });

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Description', 'Amount', 'Fee', 'Net']],
      body: stripeData,
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      styles: { font: 'helvetica', fontSize: 9 },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  }

  // Manual Transactions
  if (manualTransactions.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Manual Transactions', 20, yPos);
    yPos += 5;

    const manualData = manualTransactions.map(tx => [
      format(new Date(tx.transaction_date), 'MMM d, yyyy'),
      tx.category,
      tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      tx.description || '-',
      formatAmount(Number(tx.amount), tx.currency, currency, conversionRate),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Category', 'Type', 'Description', 'Amount']],
      body: manualData,
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      styles: { font: 'helvetica', fontSize: 9 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | XZ1 Recording Ventures Inc. | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `XZ1_Statement_${currency}_${format(dateRange.start, 'yyyy-MM-dd')}_to_${format(dateRange.end, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
