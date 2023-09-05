set -e pipefail

# Create mount directory for service
mkdir -p $MNT_DIR

echo "Mounting GCS Fuse."
gcsfuse -o allow_other --debug_gcs --debug_fuse $BUCKET $MNT_DIR/
echo $BUCKET
echo $MNT_DIR
echo "I am \"Finding\" difficult to write this to file" > $MNT_DIR/admin.txt
echo "Mounting completed."
# Start the application
node index.js &

# Exit immediately when one of the background processes terminate.
wait
# [END cloudrun_fuse_script]