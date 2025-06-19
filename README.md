# Project Collaboration Guide

## Setup Instructions

### Prerequisites
- Cursor IDE installed
- Google Drive for Desktop installed and synced
- Git (recommended for version control)

### Getting Started
1. Clone or download this project to your local machine
2. Open the project folder in Cursor
3. Install dependencies (if applicable)
4. Follow the development guidelines below

## Collaboration Guidelines

### File Organization
- Keep all project files within this directory
- Use clear, descriptive file and folder names
- Organize code by feature or functionality
- Include documentation for complex features

### Version Control (Recommended)
- Initialize a Git repository: `git init`
- Create a `.gitignore` file for sensitive files
- Commit changes regularly with descriptive messages
- Consider using GitHub/GitLab for remote backup

### Google Drive Sync Best Practices
- Enable "Stream files" mode in Google Drive for Desktop
- Avoid editing files directly in Google Drive web interface
- Use Cursor for all code editing
- Let Google Drive sync handle file synchronization

### Communication
- Use comments in code for complex logic
- Document API endpoints and data structures
- Keep a changelog of major updates
- Communicate breaking changes to team members

### File Conflicts
- Google Drive will create conflict files if multiple people edit simultaneously
- Resolve conflicts by choosing the correct version
- Consider using Git for better conflict resolution
- Coordinate on who works on which files

## Development Workflow

1. **Before Starting Work**
   - Check if anyone else is currently editing the same files
   - Pull latest changes from Google Drive
   - Create a backup of important files

2. **During Development**
   - Save files frequently
   - Test your changes locally
   - Use descriptive commit messages if using Git

3. **After Completing Work**
   - Test thoroughly
   - Update documentation if needed
   - Notify team members of changes
   - Commit and push changes (if using Git)

## Troubleshooting

### Sync Issues
- Check Google Drive sync status
- Restart Google Drive for Desktop if needed
- Ensure stable internet connection
- Check available storage space

### File Conflicts
- Look for files with "(conflicted copy)" in the name
- Compare versions and merge manually
- Delete conflict files after resolution
- Communicate with team members about conflicts

### Performance Issues
- Consider using "Mirror files" instead of "Stream files" for large projects
- Exclude build folders and node_modules from sync
- Use `.cursorignore` file to exclude unnecessary files from Cursor indexing

## Security Considerations

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Keep backup copies of important files
- Regularly review file permissions

## Contact Information

For questions or issues, contact your team lead or project manager. 