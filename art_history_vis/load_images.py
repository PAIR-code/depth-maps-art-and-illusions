import PIL.Image


#
artist = 'zupo-zupo'
year = '1988'
painting = '9223372032559836322.jpg'

images_dir = '/usr/local/google/home/ellenj/Documents/BigPicture/wikiart/wikiart-saved/images/'
full_dir = images_dir + artist + '/' + year + '/' + painting

im = PIL.Image.open(full_dir)






# import tensorflow as tf

# MPI_LAYERS = 32
# IMAGE_HEIGHT = 512
# IMAGE_WIDTH = 512

# def single_image_batch(data):
#   """Load and resize single image from a filename, returning batch of one."""
#   image = tf.image.convert_image_dtype(
#       tf.image.decode_image(data), tf.float32)[..., 0:3]
#   resized = tf.image.resize_area(
#       image[tf.newaxis, ...], [IMAGE_HEIGHT, IMAGE_WIDTH])
#   resized.set_shape([1, IMAGE_HEIGHT, IMAGE_WIDTH, 3])
#   return resized

# def main():
#   print 'Building graph'
#   global input_placeholder
#   global dirname_placeholder
#   global sess
#   global mpi_layers
#   global disparity_image

#   input_placeholder = tf.placeholder(tf.string, shape=[])
#   dirname_placeholder = tf.placeholder(tf.string, shape=[])

#   images = single_image_batch(input_placeholder)

#   mpi_tensor = nets.mpi_from_image(images, MPI_LAYERS)[0]

#   mpi_layers = []
#   for i in range(MPI_LAYERS):
#     layer = tf.image.encode_png(tf.image.convert_image_dtype(mpi_tensor[i], tf.uint8))
#     mpi_layers.append(layer)

#   # Output disparity map using full range.
#   depths = mpi.make_depths(1.0, 1000.0, MPI_LAYERS)
#   disparity = mpi.disparity_from_layers(mpi_tensor, depths)
#   min_disparity = tf.reduce_min(disparity)
#   max_disparity = tf.reduce_max(disparity)
#   disparity = (disparity - min_disparity) / (max_disparity - min_disparity)
#   disparity_image = tf.image.encode_png(tf.image.convert_image_dtype(disparity, tf.uint8))

#   # if FLAGS.output_dir:
#   #   with tf.control_dependencies(write_outputs(
#   #       images[0], mpi_layers, FLAGS.output_dir, dirname_placeholder)):
#   #     mpi_layers = [tf.identity(layer) for layer in mpi_layers]

#   # if FLAGS.checkpoint_path:
#   #   path = FLAGS.checkpoint_path
#   # else:
#   #   path = tf.train.latest_checkpoint(FLAGS.checkpoint_dir)

#   saver = tf.train.Saver()
#   sess = tf.Session()
#   print 'Restoring from %s' % path
#   saver.restore(sess, path)



# main()



