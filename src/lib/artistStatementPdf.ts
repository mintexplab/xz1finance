import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface RevenueEntry {
  id: string;
  date: string;
  partner: string;
  grossRevenue: number;
  artistSplit: number;
  labelSplit: number;
  publisherSplit: number;
  adminSplit: number;
  currency: string;
}

interface StatementOptions {
  artistName: string;
  entries: RevenueEntry[];
  statementDate?: Date;
}

export function generateArtistStatement(options: StatementOptions) {
  const { artistName, entries, statementDate = new Date() } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 0, 149); // Pink accent (#ff0095)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('XZ1 Recording Ventures', 20, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Artist Royalty Statement', 20, 35);
  
  doc.setFontSize(10);
  doc.text(`Statement Date: ${format(statementDate, 'MMMM d, yyyy')}`, pageWidth - 20, 25, { align: 'right' });
  
  // Artist Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement For:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(artistName, 20, 73);
  
  // Calculate totals
  const totals = entries.reduce(
    (acc, entry) => ({
      gross: acc.gross + entry.grossRevenue,
      artistSplit: acc.artistSplit + entry.artistSplit,
      labelSplit: acc.labelSplit + entry.labelSplit,
    }),
    { gross: 0, artistSplit: 0, labelSplit: 0 }
  );
  
  // Summary Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, 85, pageWidth - 40, 40, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Net Revenue', 30, 98);
  doc.text('Your Share (30%)', 90, 98);
  doc.text('Label Share (70%)', 150, 98);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totals.gross.toFixed(2)}`, 30, 112);
  doc.setTextColor(255, 0, 149);
  doc.text(`$${totals.artistSplit.toFixed(2)}`, 90, 112);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${totals.labelSplit.toFixed(2)}`, 150, 112);
  
  // Revenue Details Table
  let yPos = 140;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Revenue Breakdown', 20, yPos);
  yPos += 5;
  
  const tableData = entries.map(entry => [
    format(new Date(entry.date), 'MMM d, yyyy'),
    entry.partner,
    `$${entry.grossRevenue.toFixed(2)}`,
    `$${entry.artistSplit.toFixed(2)}`,
    `$${entry.labelSplit.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Source', 'Net Revenue', 'Artist (30%)', 'Label (70%)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [255, 0, 149], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 20, right: 20 },
    styles: { font: 'helvetica', fontSize: 9 },
    foot: [[
      '',
      'TOTAL',
      `$${totals.gross.toFixed(2)}`,
      `$${totals.artistSplit.toFixed(2)}`,
      `$${totals.labelSplit.toFixed(2)}`,
    ]],
    footStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
  });
  
  // Footer
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 30;
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Split Terms:', 20, finalY);
  doc.text('• Label Split: 70% of net revenue retained by XZ1 Recording Ventures Inc.', 20, finalY + 8);
  doc.text('• Artist Split: 30% of net revenue payable to artist', 20, finalY + 16);
  
  // Page footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'XZ1 Recording Ventures Inc. | Confidential',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Save
  const fileName = `XZ1_Artist_Statement_${artistName.replace(/\s+/g, '_')}_${format(statementDate, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
