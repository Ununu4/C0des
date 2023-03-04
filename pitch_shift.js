const fs = require('fs');
const { AudioContext } = require('web-audio-api');
const wavDecoder = require('wav-decoder');
const { createWriteStream } = require('fs');
const path = require('path');

// Input file path and pitch shift value (in semitones)
const inputFile = process.argv[2];
const pitchShift = parseInt(process.argv[3]);

// Load the WAV file
const fileData = fs.readFileSync(inputFile);
wavDecoder.decode(fileData).then(audioData => {

  // Create an AudioContext and AudioBufferSourceNode
  const audioContext = new AudioContext();
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioContext.createBuffer(audioData.numberOfChannels, audioData.length, audioData.sampleRate);

  // Copy the audio data into the AudioBuffer
  for (let i = 0; i < audioData.numberOfChannels; i++) {
    sourceNode.buffer.copyToChannel(audioData.channelData[i], i);
  }

  // Apply the pitch shift using a ScriptProcessorNode
  const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
  scriptNode.onaudioprocess = (event) => {
    const inputBuffer = event.inputBuffer;
    const outputBuffer = event.outputBuffer;
    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      const inputData = inputBuffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);
      for (let i = 0; i < inputBuffer.length; i++) {
        const newIndex = Math.round(i * Math.pow(2, pitchShift / 12));
        outputData[i] = inputData[newIndex] || 0;
      }
    }
  };

  // Connect the nodes and start the audio
  sourceNode.connect(scriptNode);
  scriptNode.connect(audioContext.destination);
  sourceNode.start(0);

  // Write the processed audio to a new file
  const outputFilePath = path.join(path.dirname(inputFile), `pitch-shifted_${pitchShift}st_${path.basename(inputFile)}`);
  const outputStream = createWriteStream(outputFilePath);
  outputStream.on('finish', () => {
    console.log(`Pitch shifted sound saved to ${outputFilePath}`);
    process.exit(0);
  });
  const encoder = new (require('wav-encoder').Encoder)({
    sampleRate: audioData.sampleRate,
    bitDepth: audioData.bitDepth,
    channels: audioData.numberOfChannels,
    float: true,
    symmetric: true
  });
  encoder.encode([audioData.channelData], outputStream);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
