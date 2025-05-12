
import React from "react";

interface SimulacaoLayoutProps {
  formPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
}

/**
 * Layout component for the simulation content, organizing form and results in a responsive grid
 */
const SimulacaoLayout: React.FC<SimulacaoLayoutProps> = ({ 
  formPanel, 
  resultsPanel 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        {formPanel}
      </div>
      
      <div className="lg:col-span-2">
        {resultsPanel}
      </div>
    </div>
  );
};

export default SimulacaoLayout;
