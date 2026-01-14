-- Row Level Security Policies for Sparkes

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      role = 'customer'
      OR public.is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
    AND role = 'customer'
  );

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Site settings policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

-- Customization options policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view customization options" ON public.customization_options;
CREATE POLICY "Anyone can view customization options" ON public.customization_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage customization options" ON public.customization_options;
CREATE POLICY "Admins can manage customization options" ON public.customization_options
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Products policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Product images policies
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Featured gallery policies
DROP POLICY IF EXISTS "Anyone can view featured gallery" ON public.featured_gallery;
CREATE POLICY "Anyone can view featured gallery" ON public.featured_gallery
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage featured gallery" ON public.featured_gallery;
CREATE POLICY "Admins can manage featured gallery" ON public.featured_gallery
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Custom orders policies
DROP POLICY IF EXISTS "Users can view own custom orders" ON public.custom_orders;
CREATE POLICY "Users can view own custom orders" ON public.custom_orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL))
  );

DROP POLICY IF EXISTS "Anyone can create custom orders" ON public.custom_orders;
CREATE POLICY "Anyone can create custom orders" ON public.custom_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all custom orders" ON public.custom_orders;
CREATE POLICY "Admins can view all custom orders" ON public.custom_orders
  FOR SELECT USING (public.is_admin(auth.uid()));

-- User collections policies
DROP POLICY IF EXISTS "Users can view own collections" ON public.user_collections;
CREATE POLICY "Users can view own collections" ON public.user_collections
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own collections" ON public.user_collections;
CREATE POLICY "Users can insert own collections" ON public.user_collections
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage collections" ON public.user_collections;
CREATE POLICY "Admins can manage collections" ON public.user_collections
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND customer_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- Conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- Redeemable items policies
DROP POLICY IF EXISTS "Anyone can view active redeemable items" ON public.redeemable_items;
CREATE POLICY "Anyone can view active redeemable items" ON public.redeemable_items
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage redeemable items" ON public.redeemable_items;
CREATE POLICY "Admins can manage redeemable items" ON public.redeemable_items
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Redeemable images policies
DROP POLICY IF EXISTS "Anyone can view redeemable images" ON public.redeemable_images;
CREATE POLICY "Anyone can view redeemable images" ON public.redeemable_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage redeemable images" ON public.redeemable_images;
CREATE POLICY "Admins can manage redeemable images" ON public.redeemable_images
  FOR ALL USING (
    public.is_admin(auth.uid())
  );

-- Redemptions policies
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.redemptions;
CREATE POLICY "Users can view own redemptions" ON public.redemptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create redemptions" ON public.redemptions;
CREATE POLICY "Users can create redemptions" ON public.redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage redemptions" ON public.redemptions;
CREATE POLICY "Admins can manage redemptions" ON public.redemptions
  FOR ALL USING (
    public.is_admin(auth.uid())
  );
