const PDFDocument = require('pdfkit');

// Calculate amount based on number of events
const calculateAmount = (eventsCount) => {
  if (eventsCount === 1) return 50;
  if (eventsCount === 2) return 80;
  if (eventsCount >= 3) return 120;
  return 0;
};

const generateParticipationCertificate = (userData, eventsData, teamData = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        bufferPages: true
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add background color
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f8f9fa'); // Light gray background

      // Header Section with College Colors
      doc.rect(0, 0, doc.page.width, 60)
         .fill('#dc3545'); // SRMS Red Color
      
      // Technovaganza 2025 Title
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('Technovaganza 2025', 0, 20, { align: 'center' });
      
      // Subtitle
      doc.fontSize(12)
         .font('Helvetica')
         .text('SRMS College of Engineering Technology and Research', 0, 45, { align: 'center' });

      // Main Content Container
      doc.rect(40, 80, doc.page.width - 80, doc.page.height - 200)
         .fill('#ffffff') // White background
         .stroke('#dc3545') // Red border
         .fill('#ffffff');

      // Certificate Title
      doc.fillColor('#dc3545') // Red color
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('PARTICIPATION CERTIFICATE', 0, 100, { align: 'center' });

      // Decorative Line
      doc.moveTo(80, 120)
         .lineTo(doc.page.width - 80, 120)
         .strokeColor('#dc3545')
         .lineWidth(1)
         .stroke();

      let yPosition = 140;

      // Participant Information Section
      doc.fillColor('#2c3e50') // Dark blue-gray
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PARTICIPANT INFORMATION', 60, yPosition);

      yPosition += 20;

      // Participant Details in two columns for better layout
      const leftColumn = 60;
      const rightColumn = 300;
      let currentY = yPosition;

      // Left Column Details
      doc.fillColor('#34495e')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Participant ID:', leftColumn, currentY);
      doc.font('Helvetica')
         .text(userData.pid || 'N/A', leftColumn + 80, currentY);
      
      currentY += 15;
      doc.font('Helvetica-Bold')
         .text('Name:', leftColumn, currentY);
      doc.font('Helvetica')
         .text(userData.name || 'N/A', leftColumn + 80, currentY);
      
      currentY += 15;
      doc.font('Helvetica-Bold')
         .text('Roll Number:', leftColumn, currentY);
      doc.font('Helvetica')
         .text(userData.rollno || 'N/A', leftColumn + 80, currentY);
      
      currentY += 15;
      doc.font('Helvetica-Bold')
         .text('Branch:', leftColumn, currentY);
      doc.font('Helvetica')
         .text(userData.branch || 'N/A', leftColumn + 80, currentY);

      // Right Column Details
      currentY = yPosition;
      doc.font('Helvetica-Bold')
         .text('Batch:', rightColumn, currentY);
      doc.font('Helvetica')
         .text(userData.batch || 'N/A', rightColumn + 80, currentY);
      
      currentY += 15;
      doc.font('Helvetica-Bold')
         .text('College:', rightColumn, currentY);
      doc.font('Helvetica')
         .text(userData.college || 'SRMS College of Engineering & Technology', rightColumn + 80, currentY);
      
      currentY += 15;
      doc.font('Helvetica-Bold')
         .text('Total Events:', rightColumn, currentY);
      doc.font('Helvetica')
         .text(`${eventsData.length} events`, rightColumn + 80, currentY);

      // Calculate and display amount with highlighted styling
      const eventsCount = eventsData.length;
      const amount = calculateAmount(eventsCount);
      
      currentY += 20;
      doc.fillColor('#27ae60') // Green color for amount
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Amount to be Paid: ₹${amount}`, leftColumn, currentY);

      currentY += 30;

      // Team Information (if team events exist)
      if (teamData) {
        doc.fillColor('#2c3e50')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('TEAM INFORMATION', 60, currentY);

        currentY += 20;

        doc.fillColor('#34495e')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Team ID:', 60, currentY);
        doc.font('Helvetica')
           .text(teamData.tid || 'N/A', 60 + 60, currentY);
        
        currentY += 15;
        doc.font('Helvetica-Bold')
           .text('Team Name:', 60, currentY);
        doc.font('Helvetica')
           .text(teamData.teamName || 'N/A', 60 + 60, currentY);

        currentY += 25;

        // Team Members
        if (teamData.members && teamData.members.length > 0) {
          doc.font('Helvetica-Bold')
             .text('TEAM MEMBERS:', 60, currentY);
          currentY += 15;

          teamData.members.forEach((member, index) => {
            if (currentY > doc.page.height - 150) {
              doc.addPage();
              addNewPageHeader(doc);
              currentY = 100;
            }

            const memberText = `${index + 1}. ${member.name} (${member.pid}) - ${member.branch}`;
            doc.font('Helvetica')
               .text(memberText, 80, currentY);
            currentY += 12;
          });
        }
        currentY += 20;
      }

      // Registered Events Section
      doc.fillColor('#2c3e50')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('REGISTERED EVENTS', 60, currentY);

      currentY += 20;

      // Events List
      eventsData.forEach((event, index) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 150) {
          doc.addPage();
          addNewPageHeader(doc);
          currentY = 100;
        }

        const eventType = event.eventType || event.type || 'Solo';
        
        // Event header with colored type badge
        doc.fillColor('#dc3545') // Red color for event header
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${index + 1}. ${event.name} [${eventType.toUpperCase()}]`, 60, currentY);
        
        currentY += 15;

        // Event details
        doc.fillColor('#34495e')
           .fontSize(9)
           .font('Helvetica');

        const details = [
          `Description: ${event.description || 'N/A'}`,
          event.date && `Date: ${new Date(event.date).toLocaleDateString('en-IN')}`,
          event.time && `Time: ${event.time}`,
          event.venue && `Venue: ${event.venue}`,
          event.amount > 0 && `Event Fee: ₹${event.amount}`,
          `Registration Date: ${new Date().toLocaleDateString('en-IN')}`
        ].filter(Boolean);

        details.forEach(detail => {
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            addNewPageHeader(doc);
            currentY = 100;
          }
          doc.text(`• ${detail}`, 70, currentY);
          currentY += 12;
        });

        currentY += 10;
      });

      // Payment Information Box (Always on last page)
      const paymentBoxY = doc.page.height - 180;
      doc.rect(40, paymentBoxY, doc.page.width - 80, 100)
         .fill('#fff3cd') // Light yellow background
         .stroke('#ffc107') // Yellow border
         .fill('#fff3cd');

      doc.fillColor('#856404') // Dark yellow text
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('PAYMENT INFORMATION', doc.page.width / 2, paymentBoxY + 15, { align: 'center' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Total Events Registered: ${eventsCount}`, doc.page.width / 2, paymentBoxY + 30, { align: 'center' })
         .fillColor('#27ae60') // Green for amount
         .font('Helvetica-Bold')
         .text(`Total Amount to be Paid: ₹${amount}`, doc.page.width / 2, paymentBoxY + 45, { align: 'center' })
         .fillColor('#856404') // Back to dark yellow
         .font('Helvetica')
         .text('Please submit the registration fees at the Technovaganza Registration Counter', doc.page.width / 2, paymentBoxY + 60, { align: 'center' })
         .text('Counter Location: Main Registration Desk in SRMS CET & R', doc.page.width / 2, paymentBoxY + 75, { align: 'center' })
         .text('Timing: 8:00 AM - 9:30 AM (sharp)', doc.page.width / 2, paymentBoxY + 90, { align: 'center' });

      // AUTHORISED SIGNATORY SECTION
      const signatoryY = doc.page.height - 50;
      
      // Bar line above signatory (centered)
      const lineWidth = 200;
      const lineX = (doc.page.width - lineWidth) / 2;
      
      doc.moveTo(lineX, signatoryY - 15)
         .lineTo(lineX + lineWidth, signatoryY - 15)
         .strokeColor('#000000') // Black color
         .lineWidth(1)
         .stroke();
      
      // Authorised Signatory text (centered)
      doc.fillColor('#000000') // Black color
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Authorised Signatory', doc.page.width / 2, signatoryY - 5, { align: 'center' });

      // Footer with generation date
      doc.fillColor('#7f8c8d') // Gray color
         .fontSize(8)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, doc.page.width / 2, signatoryY - 30, { align: 'center' });

      // Final decorative border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .strokeColor('#dc3545')
         .lineWidth(0.5)
         .stroke();

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to add header on new pages
const addNewPageHeader = (doc) => {
  // Add header to new page
  doc.rect(0, 0, doc.page.width, 30)
     .fill('#dc3545');
  
  doc.fillColor('#ffffff')
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Technovaganza 2025 - Participation Certificate (Continued)', doc.page.width / 2, 15, { align: 'center' });
  
  // Add border to new page
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .strokeColor('#dc3545')
     .lineWidth(0.5)
     .stroke();
};

module.exports = { 
  generateParticipationCertificate, 
  calculateAmount 
};