import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Step {
  id: string;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepPress?: (stepIndex: number) => void;
}

const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep, onStepPress }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <TouchableOpacity 
          key={step.id}
          onPress={() => onStepPress?.(index)}
          disabled={index > currentStep}
          style={[
            styles.stepContainer,
            index < steps.length - 1 && styles.hasLine,
          ]}
        >
          <View style={[
            styles.circle,
            currentStep === index && styles.currentStepCircle,
            currentStep > index && styles.completedStepCircle,
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep === index && styles.currentStepNumber,
              currentStep > index && styles.completedStepNumber,
            ]}>
              {step.id}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep === index && styles.currentStepLabel,
            currentStep > index && styles.completedStepLabel,
          ]}>
            {step.label}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.line,
              currentStep > index && styles.activeLine,
            ]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  hasLine: {
    marginRight: 24,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentStepCircle: {
    backgroundColor: '#FFF',
    borderColor: '#E53935',
    borderWidth: 2,
  },
  completedStepCircle: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  currentStepNumber: {
    color: '#E53935',
  },
  completedStepNumber: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  currentStepLabel: {
    color: '#E53935',
    fontWeight: '500',
  },
  completedStepLabel: {
    color: '#E53935',
    fontWeight: '500',
  },
  line: {
    position: 'absolute',
    right: -45,
    top: 20,
    width: 65,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  activeLine: {
    backgroundColor: '#E53935',
  },
});

export default StepProgress; 