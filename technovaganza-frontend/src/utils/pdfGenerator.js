import jsPDF from 'jspdf';

// Calculate amount based on number of events
const calculateAmount = (eventsCount) => {
  if (eventsCount === 1) return 50;
  if (eventsCount === 2) return 80;
  if (eventsCount >= 3) return 120;
  return 0;
};

// Generate Participation Certificate PDF
export const generateParticipationPDF = async (userData, registrations, events, teamData = null) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calculate amount
  const eventsCount = registrations.length;
  const amount = calculateAmount(eventsCount);

  // Add background color
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header Section with Gradient Effect
  pdf.setFillColor(220, 53, 69); // SRMS Red Color
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Technovaganza 2025 Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technovaganza 2025', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SRMS College of Engineering Technology and Research', pageWidth / 2, 30, { align: 'center' });

  // Main Content Container
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 50, pageWidth - 30, pageHeight - 100, 'F');
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 50, pageWidth - 30, pageHeight - 100, 'S');

  // Certificate Title
  pdf.setTextColor(220, 53, 69);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PARTICIPATION CERTIFICATE', pageWidth / 2, 70, { align: 'center' });

  // Decorative Line
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.8);
  pdf.line(50, 75, pageWidth - 50, 75);

  let yPosition = 90;

  // Participant Information Section
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PARTICIPANT INFORMATION', 25, yPosition);
  
  yPosition += 10;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.line(25, yPosition, pageWidth - 25, yPosition);
  
  yPosition += 15;

  // Participant Details in two columns for better layout
  const leftColumn = 30;
  const rightColumn = pageWidth / 2 + 10;
  let currentY = yPosition;

  // Left Column Details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Participant ID:', leftColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.pid || 'N/A', leftColumn + 35, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Name:', leftColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.name || 'N/A', leftColumn + 35, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Roll Number:', leftColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.rollno || 'N/A', leftColumn + 35, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Branch:', leftColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.branch || 'N/A', leftColumn + 35, currentY);

  // Right Column Details
  currentY = yPosition;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Batch:', rightColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.batch || 'N/A', rightColumn + 25, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('College:', rightColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(userData.college || 'SRMS College of Engineering & Technology', rightColumn + 25, currentY);
  
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Total Events:', rightColumn, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(`${eventsCount} events`, rightColumn + 25, currentY);

  // Amount display with highlighted styling
  currentY += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(39, 174, 96); // Green color for amount
  pdf.text(`Total Amount to be Paid: ₹${amount}`, leftColumn, currentY);

  currentY += 20;

  // Team Information (if team event)
  if (teamData) {
    // Check if we need new page
    if (currentY > pageHeight - 150) {
      addNewPage(pdf, pageWidth);
      currentY = 50;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('TEAM INFORMATION', 25, currentY);
    
    currentY += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(25, currentY, pageWidth - 25, currentY);
    
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 102, 102);
    pdf.text('Team ID:', 30, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51);
    pdf.text(teamData.tid || 'N/A', 30 + pdf.getTextWidth('Team ID: ') + 5, currentY);
    
    currentY += 8;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 102, 102);
    pdf.text('Team Name:', 30, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51);
    pdf.text(teamData.teamName || 'N/A', 30 + pdf.getTextWidth('Team Name: ') + 5, currentY);
    
    currentY += 15;

    // Team Members
    if (teamData.members && teamData.members.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('TEAM MEMBERS:', 30, currentY);
      currentY += 8;

      teamData.members.forEach((member, index) => {
        // Check if we need new page
        if (currentY > pageHeight - 80) {
          addNewPage(pdf, pageWidth);
          currentY = 50;
        }

        const memberText = `${index + 1}. ${member.name} (${member.pid}) - ${member.branch}`;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 51, 51);
        pdf.text(memberText, 35, currentY);
        currentY += 7;
      });
    }

    currentY += 10;
  }

  // Registered Events Section
  // Check if we need new page
  if (currentY > pageHeight - 200) {
    addNewPage(pdf, pageWidth);
    currentY = 50;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 51, 51);
  pdf.text('REGISTERED EVENTS', 25, currentY);
  
  currentY += 10;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(25, currentY, pageWidth - 25, currentY);
  
  currentY += 15;

  // Events List
  pdf.setFontSize(9);
  registrations.forEach((registration, index) => {
    // Check if we need new page before adding event
    if (currentY > pageHeight - 80) {
      addNewPage(pdf, pageWidth);
      currentY = 50;
    }

    const event = events.find(e => e._id === registration.eventId?._id || e._id === registration.eventId) || {};
    const eventType = registration.eventType || event.type || 'Solo';
    
    // Event header with type badge
    const eventHeader = `${index + 1}. ${event.name || 'Event'} [${eventType.toUpperCase()}]`;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text(eventHeader, 30, currentY);
    currentY += 6;

    // Event details
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(102, 102, 102);
    
    const details = [
      `Description: ${event.description || 'N/A'}`,
      `Type: ${eventType}`,
      registration.teamId && `Team ID: ${registration.teamId}`,
      event.date && `Event Date: ${new Date(event.date).toLocaleDateString('en-IN')}`,
      event.time && `Event Time: ${event.time}`,
      event.venue && `Venue: ${event.venue}`,
      event.amount > 0 && `Event Fee: ₹${event.amount}`,
      `Registration Date: ${new Date(registration.registrationDate || new Date()).toLocaleDateString('en-IN')}`
    ].filter(Boolean);

    details.forEach(detail => {
      // Check if we need new page for details
      if (currentY > pageHeight - 50) {
        addNewPage(pdf, pageWidth);
        currentY = 50;
      }
      pdf.text(`• ${detail}`, 35, currentY);
      currentY += 5;
    });

    currentY += 8;
  });

  // Payment Information Box (ALWAYS ON LAST PAGE)
  const paymentY = pageHeight - 120;
  pdf.setFillColor(255, 243, 205); // Light yellow background
  pdf.rect(20, paymentY, pageWidth - 40, 60, 'F');
  pdf.setDrawColor(255, 193, 7); // Yellow border
  pdf.setLineWidth(0.5);
  pdf.rect(20, paymentY, pageWidth - 40, 60, 'S');

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(133, 100, 4); // Dark yellow text
  pdf.text('PAYMENT INFORMATION', pageWidth / 2, paymentY + 8, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  // Amount summary
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Events Registered: ${eventsCount}`, pageWidth / 2, paymentY + 18, { align: 'center' });
  pdf.setTextColor(39, 174, 96); // Green for amount
  pdf.text(`Total Amount to be Paid: ₹${amount}`, pageWidth / 2, paymentY + 26, { align: 'center' });
  
  pdf.setTextColor(133, 100, 4); // Back to dark yellow
  pdf.setFont('helvetica', 'normal');
  pdf.text('Please submit the registration fees at the Technovaganza Registration Counter', pageWidth / 2, paymentY + 34, { align: 'center' });
  pdf.text('Counter Location: Main Registration Desk in SRMS CET & R', pageWidth / 2, paymentY + 40, { align: 'center' });
  pdf.text('Timing: 8:00 AM - 9:30 AM (sharp)', pageWidth / 2, paymentY + 46, { align: 'center' });
  pdf.text('Bring this certificate for verification', pageWidth / 2, paymentY + 52, { align: 'center' });

  // AUTHORISED SIGNATORY SECTION - ADDED AT THE BOTTOM
  const signatoryY = pageHeight - 40;
  
  // Bar line above signatory (centered)
  const lineWidth = 80; // 80mm width for the bar line
  const lineX = (pageWidth - lineWidth) / 2; // Center the line
  
  pdf.setDrawColor(0, 0, 0); // Black color for the bar line
  pdf.setLineWidth(0.5);
  pdf.line(lineX, signatoryY - 10, lineX + lineWidth, signatoryY - 10);
  
  // Authorised Signatory text (centered)
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0); // Black color
  pdf.text('Authorised Signatory', pageWidth / 2, signatoryY, { align: 'center' });

  // Footer with generation timestamp
  const footerY = signatoryY - 20;
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.3);
  pdf.line(25, footerY, pageWidth - 25, footerY);
  
  pdf.setFontSize(8);
  pdf.setTextColor(102, 102, 102);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Final decorative border around entire page
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // Save the PDF
  const fileName = `Technovaganza_${userData.pid}_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
};

// Export the calculateAmount function for use elsewhere if needed
export { calculateAmount };

// Helper function to add new page with header
const addNewPage = (pdf, pageWidth) => {
  pdf.addPage();
  
  // Add background color to new page
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), 'F');
  
  // Add header to new page
  pdf.setFillColor(220, 53, 69);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technovaganza 2025 - Participation Certificate (Continued)', pageWidth / 2, 13, { align: 'center' });
  
  // Add content container to new page
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 35, pageWidth - 30, pdf.internal.pageSize.getHeight() - 80, 'F');
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 35, pageWidth - 30, pdf.internal.pageSize.getHeight() - 80, 'S');

  // Add border around new page
  pdf.setDrawColor(220, 53, 69);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, pageWidth - 20, pdf.internal.pageSize.getHeight() - 20, 'S');
  
  return 50; // Return starting Y position for content
};

// Additional utility function for generating team certificates
export const generateTeamCertificate = async (teamData, events, registrations) => {
  // This can be implemented similarly for team-specific certificates
  console.log('Team certificate generation functionality can be added here');
};

// Utility function to format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Utility function to format time
export const formatTime = (timeString) => {
  return timeString; // Add time formatting logic if needed
};