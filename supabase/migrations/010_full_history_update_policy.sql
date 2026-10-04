-- Allow users to refresh (update) their own full Stock Analysis records
create policy "Users update own full calculator history"
  on public.stock_calculator_full_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
