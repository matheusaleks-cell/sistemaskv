import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Client } from '@/types';
import { format } from 'date-fns';

const addSignatures = (doc: jsPDF, finalY: number) => {
    const pageHeight = doc.internal.pageSize.height;
    const y = Math.max(finalY + 30, pageHeight - 50);

    doc.setDrawColor(200);
    doc.line(14, y, 90, y);
    doc.line(120, y, 196, y);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Assinatura do Cliente", 52, y + 5, { align: "center" });
    doc.text("Responsável SKV", 158, y + 5, { align: "center" });
};

const drawLogo = (doc: jsPDF, x: number, y: number) => {
    // Background rectangle for the logo
    doc.setFillColor(249, 115, 22); // Orange
    doc.roundedRect(x, y, 20, 20, 4, 4, 'F');

    // Logo Text "S"
    doc.setTextColor(255, 255, 255); // White
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("S", x + 10, y + 14, { align: "center" });

    // Company Name beside it
    doc.setTextColor(30, 41, 59); // Dark slate
    doc.setFontSize(24);
    doc.text("SKV", x + 25, y + 12);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Visual & Digital", x + 25, y + 18);
}

export const generateQuotePDF = (order: Order, client?: Client) => {
    const doc = new jsPDF();

    // Header with Logo
    drawLogo(doc, 14, 15);

    // Quote Info Box
    doc.setFillColor(248, 250, 252);
    doc.rect(140, 14, 56, 22, 'F');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`ORÇAMENTO #${order.id.slice(0, 8).toUpperCase()}`, 142, 22);
    doc.setFontSize(9);
    doc.text(`Data: ${format(new Date(order.createdAt), 'dd/MM/yyyy')}`, 142, 28);
    if (order.validUntil) {
        doc.text(`Validade: ${format(new Date(order.validUntil), 'dd/MM/yyyy')}`, 142, 33);
    }

    // Client Info
    doc.setDrawColor(241, 245, 249);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("DADOS DO CLIENTE", 14, 53);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Nome/Empresa: ${order.clientName}`, 14, 60);
    if (client) {
        doc.text(`Doc: ${client.document || 'N/I'}`, 14, 65);
        doc.text(`Tel: ${client.phone}`, 14, 70);
    }

    if (order.hasShipping) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Endereço de Entrega: ${order.shippingAddress || 'A retirar'}`, 14, 77);
        doc.text(`Frete: R$ ${order.shippingValue?.toFixed(2) || '0,00'}`, 14, 82);
    }

    // Items Table
    const tableColumn = ["Item", "Produto", "Medidas", "Qtd", "Total"];
    const tableRows: any[] = [];

    const tableStartY = order.hasShipping ? 87 : 75;

    order.items.forEach((item, index) => {
        tableRows.push([
            index + 1,
            item.productName,
            `${item.width}cm x ${item.height}cm`,
            item.quantity,
            `R$ ${item.totalPrice.toFixed(2)}`,
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 9 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`TOTAL GERAL: R$ ${order.total.toFixed(2)}`, 196, finalY, { align: "right" });

    addSignatures(doc, finalY);

    return doc;
};

export const generateOSPDF = (order: Order, client?: Client) => {
    const doc = new jsPDF();

    // OS Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 35, 'F');

    // Logo inside Dark Header
    doc.setFillColor(249, 115, 22);
    doc.roundedRect(14, 7, 20, 20, 4, 4, 'F');
    doc.setTextColor(255);
    doc.setFontSize(32);
    doc.text("S", 24, 21, { align: "center" });

    doc.setFontSize(20);
    doc.text("ORDEM DE SERVIÇO", 105, 20, { align: "center" });

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`OS #: ${order.osNumber || 'PENDENTE'}`, 14, 48);
    doc.text(`Cliente: ${order.clientName}`, 14, 55);

    if (client?.document) doc.text(`Doc: ${client.document}`, 14, 62);
    if (client?.phone) doc.text(`WhatsApp: ${client.phone}`, 14, 69);

    doc.setFontSize(11);
    doc.text(`Prazo: ${order.deadline ? format(new Date(order.deadline), 'dd/MM/yyyy') : '-'}`, 140, 48);
    doc.text(`Entrega: ${order.hasShipping ? 'SIM' : 'NÃO (RETIRA)'}`, 140, 55);

    const lineY = 78;
    doc.setDrawColor(200);
    doc.line(14, lineY, 196, lineY);

    // Tech Items Table
    const tableColumn = ["Qtd", "Produto", "Medidas", "Acabamento (Observações)"];
    const tableRows: any[] = [];

    order.items.forEach(item => {
        tableRows.push([
            item.quantity,
            item.productName,
            `${item.width}cm x ${item.height}cm`,
            item.finish || "-",
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 88,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.rect(14, finalY, 180, 40);
    doc.text("Check de Qualidade / Observações Extras:", 16, finalY + 8);

    addSignatures(doc, finalY + 45);

    return doc;
};

export const generateDeliveryCertificate = (order: Order, client?: Client) => {
    const doc = new jsPDF();

    // Header with Logo
    drawLogo(doc, 14, 15);

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("COMPROVANTE DE ENTREGA", 110, 25, { align: "center" });

    doc.setDrawColor(249, 115, 22);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Confirmamos a entrega do pedido #${order.osNumber || order.id.slice(0, 8).toUpperCase()}`, 14, 55);
    doc.text(`Cliente: ${order.clientName}`, 14, 65);
    doc.text(`Data da Entrega: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 75);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const bodyText = `Eu, ${order.clientName}, portador do documento ${client?.document || '____________________'}, declaro que recebi os produtos constantes no pedido acima em perfeitas condições e de acordo com o solicitado.`;

    const splitText = doc.splitTextToSize(bodyText, 180);
    doc.text(splitText, 14, 90);

    // Signatures
    const y = 140;
    doc.line(40, y, 170, y);
    doc.text("Assinatura do Recebedor", 105, y + 8, { align: "center" });

    doc.setFontSize(9);
    doc.text(`SKV - Soluções em Comunicação Visual - Emitido em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 280, { align: "center" });

    return doc;
};
