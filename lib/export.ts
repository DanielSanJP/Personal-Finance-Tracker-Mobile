import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface Transaction {
  id: string;
  description: string;
  category: string | null;
  date: string;
  amount: number;
  type: string;
  merchant?: string | null;
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Export transactions to CSV file
 */
export const exportTransactionsToCSV = async (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    Alert.alert('No Data', 'No transactions to export');
    return;
  }

  try {
    const headers = ['Description', 'Category', 'Date', 'Amount', 'Type', 'Merchant'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...transactions.map((transaction) => [
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${(transaction.category || 'Other').replace(/"/g, '""')}"`,
        `"${formatDate(transaction.date)}"`,
        transaction.amount.toFixed(2),
        `"${transaction.type}"`,
        `"${(transaction.merchant || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Create file path with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `transactions-${timestamp}.csv`;
    
    // Create file using modern API
    const file = new File(Paths.cache, fileName);

    // Create file and write using writable stream
    file.create({ overwrite: true });
    
    // Write content using writable stream
    const writer = file.writableStream().getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(csvContent));
    await writer.close();

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Export Complete',
        `File saved to: ${file.uri}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Share the file
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Transactions',
      UTI: 'public.comma-separated-values-text',
    });

    Alert.alert(
      'Export Successful',
      `Exported ${transactions.length} transactions to CSV`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    Alert.alert(
      'Export Failed',
      'An error occurred while exporting to CSV',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Export transactions to PDF file (using HTML template)
 */
export const exportTransactionsToPDF = async (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    Alert.alert('No Data', 'No transactions to export');
    return;
  }

  try {
    // Create HTML content for PDF
    const today = new Date().toLocaleDateString('en-GB');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #333;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .info {
      font-size: 11px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #475569;
      color: white;
      padding: 10px 6px;
      text-align: left;
      font-weight: bold;
      font-size: 11px;
    }
    td {
      padding: 10px 6px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
  </style>
</head>
<body>
  <h1>Transaction History</h1>
  
  <div class="info">
    <p>Export Date: ${today}</p>
    <p>Total Records: ${transactions.length}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Category</th>
        <th>Date</th>
        <th>Amount</th>
        <th>Type</th>
        <th>Merchant</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map(t => `
        <tr>
          <td>${t.description}</td>
          <td>${t.category || 'Other'}</td>
          <td>${formatDate(t.date)}</td>
          <td>$${t.amount.toFixed(2)}</td>
          <td>${t.type}</td>
          <td>${t.merchant || ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    // Create file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `transactions-${timestamp}.html`;
    
    // Create file using modern API
    const file = new File(Paths.cache, fileName);

    // Create file and write using writable stream
    file.create({ overwrite: true });
    
    // Write content using writable stream
    const writer = file.writableStream().getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(htmlContent));
    await writer.close();

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Export Complete',
        `File saved to: ${file.uri}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Share the file (as HTML which can be printed to PDF)
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/html',
      dialogTitle: 'Export Transactions (Print to PDF)',
      UTI: 'public.html',
    });

    Alert.alert(
      'Export Successful',
      `Exported ${transactions.length} transactions. You can print to PDF from your device.`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    Alert.alert(
      'Export Failed',
      'An error occurred while exporting to PDF',
      [{ text: 'OK' }]
    );
  }
};
