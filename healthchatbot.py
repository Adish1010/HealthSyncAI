from transformers import pipeline

# Load the model and tokenizer using the pipeline API
pipe = pipeline("text-classification", model="Zabihin/Symptom_to_Diagnosis", tokenizer="Zabihin/Symptom_to_Diagnosis")

# Input text (symptom description)
input_text = "I've been having headaches and migraines, and I can't sleep. My whole body shakes and twitches. Sometimes I feel lightheaded."

# Get the prediction
result = pipe(input_text)

# Print the predicted label
predicted_label = result[0]['label']
print("Predicted Label:", predicted_label)
