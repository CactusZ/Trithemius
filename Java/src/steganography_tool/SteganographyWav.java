package Java.src.steganography_tool;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class SteganographyWav {
    
    public static final int bitsLength = 32;// how many bits for message length

    public static void encryptBuffer(long[] buffer, int x, int channelCount, int bitsLength) {

        for (int i = 0; i < bitsLength * channelCount; i += channelCount) {
            buffer[i] = ((buffer[i] >> 1) << 1) ^ (x % 2);
            x = x >> 1;
        }
    }

    public static void encryptMessage(String message, WavFile fileIn, WavFile fileOut) {

        try {

            // Get the number of audio channels in the wav file
            int numChannels = fileIn.getNumChannels();

            // Create a buffer for messageLength
            long[] buffer = new long[bitsLength * numChannels];

            //encrypting message length
            int messageLength = message.length();

            fileIn.readFrames(buffer, bitsLength);
            encryptBuffer(buffer, messageLength, numChannels, bitsLength);
            fileOut.writeFrames(buffer, bitsLength);

            //encrypting message
            buffer = new long[8 * numChannels];
            int i = 0;
            int framesRead;
            do {
                framesRead = fileIn.readFrames(buffer, 8);
                if (i < messageLength) {
                    encryptBuffer(buffer, (int) message.charAt(i), numChannels, 8);
                    i++;
                }
                fileOut.writeFrames(buffer, 8);
            } while (framesRead != 0);

        } catch (Exception e) {
            System.err.println(e);
        }
    }

    public static void encryptMessage(FileInputStream messageFile, WavFile fileIn, WavFile fileOut) {

        try {
            // Get the number of audio channels in the wav file
            int numChannels = fileIn.getNumChannels();

            // Create a buffer for messageLength
            long[] buffer = new long[bitsLength * numChannels];

            //encrypting message length
            int messageLength = (int) messageFile.getChannel().size();
            
            fileIn.readFrames(buffer, bitsLength);
            encryptBuffer(buffer, messageLength, numChannels, bitsLength);
            fileOut.writeFrames(buffer, bitsLength);

            //encrypting message
            buffer = new long[8 * numChannels];
            int bytebuf;
            int i = 0;
            int framesRead;
            do {
                framesRead = fileIn.readFrames(buffer, 8);
                if (i < messageLength) {
                    bytebuf = messageFile.read();
                    encryptBuffer(buffer, bytebuf, numChannels, 8);
                    //           writer.write(bytebuf + "\n");
                    i++;
                }
                fileOut.writeFrames(buffer, 8);
            } while (framesRead != 0);

        } catch (Exception e) {
            System.err.println(e);
        }
    }

    public static int decryptBuffer(long[] buffer, int channelCount, int bitsLength) {
        int res = 0;
        int power2 = 1;
        for (int i = 0; i < bitsLength * channelCount; i += channelCount) {
            res = (res) + ((int) (buffer[i] % 2) & 1) * (power2);
            power2 = power2 << 1;
        }
        return res;
    }

    public static String decryptMessage(WavFile file) {
        String message = new String("");
        try {
            
            int channelCount = file.getNumChannels();
            long[] buffer = new long[bitsLength * channelCount];
            
            //decrypting length
            file.readFrames(buffer, bitsLength);
            int messageLength = decryptBuffer(buffer, channelCount, bitsLength);
            buffer = new long[8 * channelCount];
            
            for (int i = 0; i < messageLength; i++) {
                file.readFrames(buffer, 8);
                message += (char) decryptBuffer(buffer, channelCount, 8);
            }

        } catch (Exception e) {
            System.err.println(e);
        }
        return message;
    }

    public static int decryptMessage(WavFile file, FileOutputStream out) {
        int messageLength = 0;
        try {
            int channelCount = file.getNumChannels();
            long[] buffer = new long[bitsLength * channelCount];
            
            //decrypting length
            file.readFrames(buffer, bitsLength);
            messageLength = decryptBuffer(buffer, channelCount, bitsLength);
            buffer = new long[8 * channelCount];
            
            int bytebuf;
            for (int i = 0; i < messageLength; i++) {
                file.readFrames(buffer, 8);
                bytebuf = decryptBuffer(buffer, channelCount, 8);
                out.write(bytebuf);

            }

        } catch (Exception e) {
            System.err.println(e);
        }
        return messageLength;
    }
}