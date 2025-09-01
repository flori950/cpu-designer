# Processor Design Tool

A comprehensive visual processor design tool that allows users to create and validate CPU architectures using drag-and-drop components with advanced compilation and validation features.

## Core Features

### 🔧 Advanced Components & Examples
- **19 Standard Components**: Basic, advanced, control, and I/O components
- **Example CPUs**: 4 pre-built processor templates (Simple, RISC, CISC, Pipelined)
- **Load/Save Designs**: Import/export designs in JSON format with full component preservation
- **Component Library**: ALU, Register File, Memory units, Control Unit, and more

### 🔍 Validation & Compilation
- **Design Validation**: Real-time circuit validation with detailed feedback
- **Multi-target Compilation**: Generate code for Verilog, VHDL, SystemC, and C++
- **Error Detection**: Comprehensive validation rules and error reporting

### 🧪 Testing & Quality
- **Comprehensive Test Suite**: 12+ test cases covering all functionality
- **Pre-commit Hooks**: Automated code quality checks before commits
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions

### 🚀 Automation & Deployment
- **Dependency Management**: Renovate bot for automated updates
- **FTP Deployment**: Automated deployment to production server
- **Performance Optimization**: Optimized build process with code splitting

### 🔧 **Enhanced Component Library**
**Basic Components:**
- **ALU** (🧮): Arithmetic Logic Unit with input/output ports
- **Register** (📝): Data storage with input/output connections  
- **Memory** (💾): Memory unit with address and data ports
- **Control Unit** (🎛️): Processor control with instruction input and control outputs

**Advanced Components:**
- **Cache** (⚡): High-speed memory cache with CPU/Memory interfaces
- **Decoder** (🔍): Instruction decoder with multiple outputs
- **Multiplexer** (🔀): Data selector with multiple inputs and select line
- **Bus** (🚌): Data bus for connecting multiple components
- **Clock** (⏰): System clock generator

**I/O Components:**
- **Input Port** (📥): External data input interface
- **Output Port** (📤): External data output interface
- **Interrupt** (⚠️): Interrupt handling component

### 🎨 **Advanced Canvas Features**
- Visual editor for connecting components with bus systems
- Interactive canvas with real-time feedback
- Connection mode for linking component ports
- Component selection and manipulation
- Automatic connection routing

### ✅ **Design Validation System**
- **Architecture Completeness**: Checks for essential processor components
- **Connection Analysis**: Validates all input/output connections
- **Cycle Detection**: Identifies circular dependencies in design
- **Component Recommendations**: Suggests missing components (e.g., clock)
- **Detailed Validation Reports**: Color-coded results with specific recommendations

### 🔄 **Enhanced Simulation**
- Execute processor commands (ADD, LOAD, STORE, MOV, CACHE, INT)
- Real-time command simulation with component-aware feedback
- Command history and output logging
- Toggle simulation panel with enhanced controls

### � **Code Compilation & Export**
**Compilation Targets:**
- **Verilog HDL**: Hardware description language output
- **VHDL**: Alternative HDL format
- **Assembly Code**: Low-level assembly representation
- **JSON Description**: Structured data export with metadata

**Export Features:**
- Complete design metadata and statistics
- Component positioning and connection data
- Timestamped exports with author attribution
- Downloadable files for external tools

### 💾 **Session Management**
- Auto-save every 5 seconds using sessionStorage
- Design persistence during browser session
- No permanent database storage (privacy-focused)
- Session recovery after page refresh

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with HTML5 Canvas support

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the displayed URL (typically `http://localhost:5173`)

## Usage Guide

### Adding Components
1. **Basic Components**: Drag from "Basic Components" section (ALU, Register, Memory, Control Unit)
2. **Advanced Components**: Use Cache, Decoder, Multiplexer, Bus, Clock for complex designs
3. **I/O Components**: Add Input/Output ports and Interrupt handlers
4. Components automatically include appropriate connection points

### Creating Connections
1. Toggle "Connection Mode" in the top-right corner
2. Click on an output point (teal), then click on an input point (red)
3. Connections are validated (output→input, different components only)
4. Toggle off connection mode to return to component manipulation

### Design Validation
1. Click "Validate Design" to run comprehensive checks
2. Review validation results in the popup panel:
   - ✅ **Success**: Design passes validation criteria
   - ⚠️ **Warning**: Recommendations for improvement
   - ❌ **Error**: Critical issues requiring attention
3. Address issues based on specific recommendations

### Code Compilation
1. Click "Compile Design" to open compilation panel
2. Select target format:
   - **Verilog HDL**: For FPGA/ASIC implementation
   - **VHDL**: Alternative hardware description
   - **Assembly**: Low-level instruction representation
   - **JSON**: Structured data with full metadata
3. Click "Compile" to generate code
4. Copy or save the generated output

### Enhanced Simulation
1. Click "Simulate" to open the enhanced simulation panel
2. Enter commands with expanded instruction set:
   - `ADD R1, R2` - Add two register values
   - `LOAD R1` - Load data from memory
   - `STORE R1, 100` - Store register to memory address
   - `MOV R1, R2` - Move data between registers
   - `CACHE R1` - Cache operation
   - `INT 1` - Trigger interrupt
3. Commands are validated against available components

## Technical Architecture

### Enhanced File Structure
```
processor-app/
├── src/
│   ├── main.js          # Core application with validation & compilation
│   └── style.css        # Enhanced styling with new components
├── index.html           # Updated HTML with SEO optimization
├── .github/
│   └── copilot-instructions.md  # Development guidelines
├── package.json         # Project dependencies
└── README.md           # This documentation
```

### Validation Engine
- **Component Analysis**: Validates processor architecture completeness
- **Connection Validation**: Ensures proper input/output connections
- **Cycle Detection**: Uses DFS algorithm to detect circular dependencies
- **Performance Metrics**: Analyzes design complexity and recommendations

### Compilation System
- **Multi-target Support**: Generates code for various platforms
- **Template-based Generation**: Extensible compilation framework
- **Metadata Integration**: Includes design statistics and attribution
- **Standards Compliance**: Follows HDL and assembly conventions

### SEO & Accessibility
- **Complete Meta Tags**: Title, description, keywords, Open Graph
- **Structured Data**: Schema.org markup for search engines
- **Responsive Design**: Mobile-friendly interface
- **Author Attribution**: Links to florian-hunter.de and GitHub

## Quick Start

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access the Application**: Open http://localhost:5173 in your browser

3. **Design Your Processor**:
   - Drag components from the palette to the canvas
   - Connect components using the connection mode
   - Validate your design with the validation tool
   - Export your design as JSON or compile to HDL

4. **Load Existing Designs**:
   - Click "Load Design" to import a JSON design file
   - Use "Load Example" to start with pre-built CPU templates
   - Designs are automatically saved to session storage

## Development Commands

```bash
# Development
npm run dev       # Start development server with hot reload
npm start         # Alias for npm run dev

# Testing
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI interface
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint      # Check code quality with ESLint
npm run lint:fix  # Fix ESLint issues automatically
npm run format    # Format code with Prettier

# Production
npm run build     # Build optimized production bundle
npm run preview   # Preview production build locally

# Automation
npm run prepare   # Setup pre-commit hooks
```

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Advanced Features

### 🏗️ **Example CPU Architectures**
**Pre-built Templates:**
- **Simple 8-bit CPU**: Basic architecture with ALU, registers, memory, and control unit
- **RISC Processor**: Reduced instruction set computer with optimized pipeline
- **Pipelined CPU**: 5-stage pipeline (Fetch → Decode → Execute → Memory → Writeback)
- **Microcontroller**: Complete system with I/O ports, interrupts, and bus architecture

### 🧪 **Comprehensive Testing Suite**
- **Unit Tests**: 12+ test cases covering all major functionality
- **Validation Testing**: Architecture completeness and cycle detection
- **Component Testing**: Library components and connection points
- **Compilation Testing**: Code generation for multiple targets
- **Session Testing**: Storage and persistence functionality

### 🔧 **Development Automation**
**Pre-commit Hooks:**
- **ESLint**: Code quality and style enforcement
- **Prettier**: Automatic code formatting
- **Test Execution**: Automated testing before commits

**CI/CD Pipeline:**
- **Automated Testing**: Multi-node version testing (18.x, 20.x)
- **Code Quality**: Linting and formatting validation
- **Build Verification**: Production build testing
- **FTP Deployment**: Automatic deployment to florian-hunter.de
- **Dependency Updates**: Renovate bot for automated updates

### 📦 **Deployment & Hosting**
- **GitHub Actions**: Automated CI/CD workflow
- **FTP Deployment**: Direct deployment to production server
- **Build Artifacts**: Versioned builds with metadata
- **Rollback Support**: Easy version management
- **Monitoring**: Deployment logs and status tracking

### Component System Architecture
Each component includes:
- **Type Definition**: Unique identifier and behavior
- **Connection Points**: Typed input/output ports with labels
- **Visual Properties**: Icon, positioning, styling
- **Validation Rules**: Component-specific validation logic

### Validation Framework
- **Rule-based System**: Extensible validation rules
- **Severity Levels**: Success, Warning, Error classifications
- **Interactive Results**: Clickable validation items
- **Performance Optimized**: Efficient graph algorithms

### Compilation Pipeline
- **Abstract Syntax Tree**: Internal design representation
- **Code Templates**: Modular generation system
- **Target Abstraction**: Platform-independent design model
- **Metadata Preservation**: Complete design context retention

## Contributing & Attribution

### Created By
**Florian Hunter**
- 🌐 Website: [florian-hunter.de](https://florian-hunter.de)
- 🐙 GitHub: [@flori950](https://github.com/flori950)

### Future Enhancements
- Real-time collaboration features
- Advanced simulation with timing analysis
- Component library expansion
- Performance optimization tools
- Integration with external HDL tools
- Waveform visualization
- Multi-level hierarchical design

## License & Usage

This educational tool is created for learning computer architecture concepts. Feel free to use, modify, and extend for educational and research purposes.

**© 2025 florian-hunter.de - Processor Design Tool v1.0**
