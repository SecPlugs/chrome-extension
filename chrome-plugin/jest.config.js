module.exports = {
    // Add this line to your Jest config
    setupFilesAfterEnv: ['./jest.setup.js'],
    moduleFileExtensions: ['js', 'jsx'],
    verbose: true,
    moduleNameMapper: {
        ".+\\.(css|styl|less|html|sass|scss|png|jpg|ttf|woff|woff2)$": "identity-obj-proxy"
    }
}