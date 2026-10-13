-- Allow refresh (update) of own full Stock Analysis rows — required for re-run with same id

create policy "Users update own full calculator history"
  on public.stock_calculator_full_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
