import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a professional PDF invoice for a patient
 * @param {Object} invoice - The invoice data
 * @param {Object} user - The current patient user data
 */
export const generateInvoicePDF = (invoice, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Styling
  doc.setFillColor(37, 99, 235); // Primary-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VITALIS HOSPITAL', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Financial Statement', 15, 32);
  
  doc.text('INV-#' + invoice._id.slice(-6).toUpperCase(), pageWidth - 15, 20, { align: 'right' });
  doc.text('Date: ' + new Date().toLocaleDateString(), pageWidth - 15, 27, { align: 'right' });

  // Bill To / Hospital Info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user.name}`, 15, 62);
  doc.text(`Patient ID: ${user._id}`, 15, 68);
  doc.text(`Email: ${user.email}`, 15, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL DETAILS', pageWidth - 15, 55, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Vitalis Medical Center', pageWidth - 15, 62, { align: 'right' });
  doc.text('123 Healthcare Blvd, Medical District', pageWidth - 15, 68, { align: 'right' });
  doc.text('contact@vitalis.com | +1 (555) 000-1234', pageWidth - 15, 74, { align: 'right' });

  // Invoice Details Table
  const tableColumn = ["Description", "Service Date", "Cost"];
  const tableRows = [];

  // Adding items to table
  invoice.items.forEach(item => {
    const itemData = [
      item.description,
      new Date(invoice.createdAt).toLocaleDateString(),
      `$${item.cost.toLocaleString()}`
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 100 },
      2: { halign: 'right' }
    }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount Due:', pageWidth - 60, finalY);
  doc.text(`$${invoice.amount.toLocaleString()}`, pageWidth - 15, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Status:', pageWidth - 60, finalY + 7);
  doc.setTextColor(invoice.status === 'Paid' ? [16, 185, 129] : [245, 158, 11]);
  doc.text(invoice.status.toUpperCase(), pageWidth - 15, finalY + 7, { align: 'right' });

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 270, pageWidth - 15, 270);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('This is a computer-generated document and does not require a physical signature.', pageWidth / 2, 277, { align: 'center' });
  doc.text('Vitalis HMS Secure Invoicing System v2.4', pageWidth / 2, 282, { align: 'center' });

  doc.save(`Vitalis_Invoice_${invoice._id.slice(-6).toUpperCase()}.pdf`);
};

/**
 * Generate a professional Medical Record PDF
 * @param {Object} record - The medical record data
 * @param {Object} user - The patient user data
 */
export const generateRecordPDF = (record, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL RECORD', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Vitalis Patient Health Information', 15, 32);
  
  doc.text('REC-#' + record._id.slice(-6).toUpperCase(), pageWidth - 15, 25, { align: 'right' });

  // Patient Info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT PROFILE', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Full Name: ${user.name}`, 15, 63);
  doc.text(`Patient ID: ${user._id}`, 15, 69);
  doc.text(`Date of Record: ${new Date(record.createdAt).toLocaleDateString()}`, 15, 75);

  // Record Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DIAGNOSIS & CLINICAL NOTES', 15, 95);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Diagnosis:', 15, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(record.diagnosis, 45, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Attending Physician:', 15, 112);
  doc.setFont('helvetica', 'normal');
  doc.text(record.doctor, 60, 112);

  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Observations:', 15, 125);
  doc.setFont('helvetica', 'normal');
  const splitTreatment = doc.splitTextToSize(record.treatment, pageWidth - 30);
  doc.text(splitTreatment, 15, 132);

  // Recommendations
  if (record.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Provider Recommendations:', 15, 160);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(record.notes, pageWidth - 30);
    doc.text(splitNotes, 15, 167);
  }

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 270, pageWidth - 15, 270);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Confidential medical information. Subject to HIPAA regulations.', pageWidth / 2, 277, { align: 'center' });
  doc.text('Vitalis HMS Secure Records Portal', pageWidth / 2, 282, { align: 'center' });

  doc.save(`Vitalis_Record_${record._id.slice(-6).toUpperCase()}.pdf`);
};
