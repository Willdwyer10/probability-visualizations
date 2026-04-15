import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

function runDemo() {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '#step-dist-selector',
        popover: {
          title: 'Select a Distribution',
          description: 'Click here to choose which probability distribution you want to explore. The app will update immediately.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#step-parameters',
        popover: {
          title: 'Adjust Parameters',
          description: 'Use these sliders or number inputs to tweak the distribution parameters in real time.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#step-formula',
        popover: {
          title: 'Theoretical Formula',
          description: 'Here you can see the underlying mathematical formula for the probability mass or density function.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#step-chart-controls',
        popover: {
          title: 'Chart Controls',
          description: 'Toggle the PMF/PDF and CDF overlays. You can also lock the X or Y axes to compare how parameters change the curve without the chart rescaling.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#step-calculator',
        popover: {
          title: 'Probability Calculator',
          description: 'Use this calculator to compute exact probabilities by dragging the handles on the chart or typing values directly.',
          side: 'left',
          align: 'start'
        }
      }
    ]
  });

  driverObj.drive();
}

export function WalkthroughDemoButton() {
  return (
    <button className="header-mini-btn" type="button" onClick={runDemo}>
      Demo
    </button>
  );
}
